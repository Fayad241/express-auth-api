import { Router } from "express";
import { PasswordController } from "#controllers/password.controller";
import { asyncHandler } from "#lib/async-handler";
import { authenticate } from "#middlewares/auth";
import { authLimiter } from "#lib/rate-limiter";

const router = Router();

// Demander la réinitialisation du mot de passe
// 5 tentatives par 15 minutes
router.post("/forgot", authLimiter, asyncHandler(PasswordController.forgotPassword));

// Réinitialiser le mot de passe avec token
// 5 tentatives par 15 minutes
router.post("/reset", authLimiter, asyncHandler(PasswordController.resetPassword));


// Changer le mot de passe (utilisateur connecté)
// Authentification requise
router.post("/change", authenticate, asyncHandler(PasswordController.changePassword));

export default router;