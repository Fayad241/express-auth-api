import { Router } from "express";
import { TwoFactorController } from "#controllers/two-factor.controller";
import { asyncHandler } from "#lib/async-handler";
import { authenticate } from "#middlewares/auth";

const router = Router();

// Activer le 2FA (génère le QR code)
router.post("/enable", authenticate, asyncHandler(TwoFactorController.enable));

// Vérifier le code et activer définitivement
router.post("/verify", authenticate, asyncHandler(TwoFactorController.verify));

// Désactiver le 2FA
router.post("/disable", authenticate, asyncHandler(TwoFactorController.disable));

/* Valider le code 2FA lors de la connexion
Pas d'authentification (utilisé après login) */
router.post("/validate", asyncHandler(TwoFactorController.validate));

export default router;