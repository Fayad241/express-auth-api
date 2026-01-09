import { Router } from "express";
import authRoutes from "./auth.routes.js";
// import emailRoutes from "./email.routes.js";
import passwordRoutes from "./password.routes.js";
import oauthRoutes from "./oauth.routes.js";
import twoFactorRoutes from "./two-factor.routes.js";
import sessionRoutes from "./session.routes.js";
import profileRoutes from "./profile.routes.js";

const router = Router();

// Monter toutes les routes
router.use("/auth", authRoutes);
// router.use("/email", emailRoutes);
router.use("/password", passwordRoutes);
router.use("/oauth", oauthRoutes);
router.use("/2fa", twoFactorRoutes);
router.use("/sessions", sessionRoutes);
router.use("/profile", profileRoutes);

export default router;