import { Router } from "express";
import { ProfileController } from "#controllers/profile.controller";
import { asyncHandler } from "#lib/async-handler";
import { authenticate } from "#middlewares/auth";

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Consulter son profil 
router.get("/", asyncHandler(ProfileController.getProfile));

// Modifier son profil 
router.patch("/", asyncHandler(ProfileController.updateProfile));

// Supprimer son compte (soft delete) 
router.delete("/", asyncHandler(ProfileController.deleteAccount));

// Consulter l'historique des connexions 
router.get("/login-history", asyncHandler(ProfileController.getLoginHistory));

export default router;