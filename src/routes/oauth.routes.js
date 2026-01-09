import { Router } from "express";
import passport from "#lib/passport";
import { OAuthController } from "#controllers/oauth.controller";
import { asyncHandler } from "#lib/async-handler";

const router = Router();

// Redirection vers Google pour authentification
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    accessType: 'offline',
    prompt: 'consent'
  })
);

// Callback après authentification Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`,
  }),
  asyncHandler(OAuthController.googleCallback)
);

export default router;