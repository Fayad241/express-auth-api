import { Router } from "express";
import { EmailController } from "#controllers/email.controller";
import { asyncHandler } from "#lib/async-handler";
import { authenticate } from "#middlewares/auth";

const router = Router();

/**
 * GET /email/verify?token=xxx
 * Vérifier l'email avec le token
 * Route publique (pas d'authentification)
 */
router.get("/verify", asyncHandler(EmailController.verifyEmail));

/**
 * POST /email/resend
 * Renvoyer l'email de vérification
 * Authentification requise
 */
router.post("/resend", authenticate, asyncHandler(EmailController.resendVerificationEmail));

export default router;