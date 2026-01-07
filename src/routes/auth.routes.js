import { Router } from "express";
import { AuthController } from "#controllers/auth.controller";
import { asyncHandler } from "#lib/async-handler";
import { authenticate } from "#middlewares/auth";
import { authLimiter } from "#lib/rate-limiter";

const router = Router();

// Inscription d'un nouvel utilisateur, 5 tentatives par 15 minutes
router.post("/register", authLimiter, asyncHandler(AuthController.register));

// Connexion d'un utilisateur, 5 tentatives par 15 minutes
router.post("/login", authLimiter, asyncHandler(AuthController.login));

// Déconnexion (révoque les tokens)
router.post("/logout", authenticate, asyncHandler(AuthController.logout));

// Rafraîchir les tokens
router.post("/refresh", asyncHandler(AuthController.refresh));

export default router;