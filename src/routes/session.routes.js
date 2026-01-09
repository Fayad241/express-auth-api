import { Router } from "express";
import { authenticate } from "#middlewares/auth";
import { asyncHandler } from "#lib/async-handler";
import { SessionController } from "#controllers/session.controller";

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Lister toutes les sessions actives
router.get("/", asyncHandler(SessionController.getSessions));

// Révoquer toutes les autres sessions (sauf la session actuelle)
router.delete("/others", asyncHandler(SessionController.revokeOtherSessions));

// Révoquer une session spécifique
router.delete("/:id", asyncHandler(SessionController.revokeSession));


export default router;
