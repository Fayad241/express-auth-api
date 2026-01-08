import { Router } from "express";
import { authenticate } from "#middlewares/auth";
import { asyncHandler } from "#lib/async-handler";
import { SessionController } from "#controllers/session.controller";

const router = Router();

router.get("/", authenticate, asyncHandler(SessionController.getSessions));
router.delete("/:id", authenticate, asyncHandler(SessionController.revokeSession));
router.delete("/", authenticate, asyncHandler(SessionController.revokeOtherSessions));

export default router;
