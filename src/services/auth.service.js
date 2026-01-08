import prisma from "#lib/prisma";
import { hashPassword, verifyPassword } from "#lib/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken, decodeToken } from "#lib/jwt";
import { sendVerificationEmail } from "#lib/email";
import { ConflictException, UnauthorizedException, NotFoundException } from "#lib/exceptions";
import { nanoid } from "nanoid";

export class AuthService {
  // Inscription d'un nouvel utilisateur
  static async register(data, userAgent, ipAddress) {
    const { email, password, firstName, lastName } = data;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException("Cet email est déjà utilisé");
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    // Créer un token de vérification d'email
    const verificationToken = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24h

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    // Envoyer l'email de vérification
    await sendVerificationEmail(user.email, verificationToken);

    // Enregistrer la connexion dans l'historique
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        success: true,
        ipAddress,
        userAgent,
      },
    });

    // Générer les tokens JWT
    const accessToken = await signAccessToken({ userId: user.id });
    const refreshToken = await signRefreshToken({ userId: user.id });

    // Stocker le refresh token en BDD
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 jours

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
        userAgent,
        ipAddress,
      },
    });

    return { user, accessToken, refreshToken };
  }

  // Connexion d'un utilisateur
  static async login(email, password, userAgent, ipAddress) {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });

    // Vérifier le mot de passe
    const isPasswordValid = user && user.password
      ? await verifyPassword(user.password, password)
      : false;

    // Enregistrer la tentative dans l'historique SEULEMENT si l'utilisateur existe
    if (user) {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          success: isPasswordValid,
          ipAddress,
          userAgent,
        },
      });
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    // Vérifier si le compte est désactivé
    if (user.disabledAt) {
      throw new UnauthorizedException("Votre compte a été désactivé");
    }

    // Si 2FA activé, retourner un indicateur
    if (user.twoFactorEnabledAt) {
      return {
        user,
        requires2FA: true,
      };
    }

    // Générer les tokens
    const accessToken = await signAccessToken({ userId: user.id });
    const refreshToken = await signRefreshToken({ userId: user.id });

    // Stocker le refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
        userAgent,
        ipAddress,
      },
    });

    return { user, accessToken, refreshToken, requires2FA: false };
  }

  // Déconnexion (révoque le refresh token)
  static async logout(refreshToken, accessToken) {
    // Révoquer le refresh token
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (tokenRecord) {
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    }

    // Blacklister l'access token
    const decoded = decodeToken(accessToken);
    const expiresAt = new Date(decoded.exp * 1000);

    await prisma.blacklistedAccessToken.create({
      data: {
        token: accessToken,
        userId: decoded.userId,
        expiresAt,
      },
    });

    return true;
  }

  // Rafraîchir les tokens
  static async refreshTokens(refreshToken, userAgent, ipAddress) {
    // Vérifier le refresh token
    let payload;
    try {
      payload = await verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedException("Refresh token invalide ou expiré");
    }

    // Vérifier que le token existe en BDD et n'est pas révoqué
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.revokedAt) {
      throw new UnauthorizedException("Refresh token révoqué");
    }

    // Vérifier l'expiration
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException("Refresh token expiré");
    }

    // Charger l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.disabledAt) {
      throw new UnauthorizedException("Utilisateur non trouvé ou désactivé");
    }

    // Révoquer l'ancien refresh token
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });

    // Générer de nouveaux tokens
    const newAccessToken = await signAccessToken({ userId: user.id });
    const newRefreshToken = await signRefreshToken({ userId: user.id });

    // Stocker le nouveau refresh token
    const newRefreshTokenExpiry = new Date();
    newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt: newRefreshTokenExpiry,
        userAgent,
        ipAddress,
      },
    });

    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}