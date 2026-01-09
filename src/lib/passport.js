import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "#lib/prisma";

// Configuration de la stratégie Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extraire les informations du profil Google
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName;
        const lastName = profile.name?.familyName;
        const providerId = profile.id;

        if (!email) {
          return done(new Error("Email non fourni par Google"), null);
        }

        // Chercher un compte OAuth existant
        let oauthAccount = await prisma.oAuthAccount.findUnique({
          where: {
            provider_providerId: {
              provider: "google",
              providerId,
            },
          },
          include: { user: true },
        });

        // Si le compte OAuth existe, retourner l'utilisateur
        if (oauthAccount) {
          return done(null, oauthAccount.user);
        }

        // Chercher un utilisateur existant avec cet email
        let user = await prisma.user.findUnique({ where: { email } });

        // Si l'utilisateur existe, lier le compte OAuth
        if (user) {
          oauthAccount = await prisma.oAuthAccount.create({
            data: {
              provider: "google",
              providerId,
              userId: user.id,
            },
          });

          return done(null, user);
        }

        // Créer un nouvel utilisateur + compte OAuth
        user = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            emailVerifiedAt: new Date(), // Email vérifié par Google
            password: null, // Pas de mot de passe pour OAuth
          },
        });

        await prisma.oAuthAccount.create({
          data: {
            provider: "google",
            providerId,
            userId: user.id,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;