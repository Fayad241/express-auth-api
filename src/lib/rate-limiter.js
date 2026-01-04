import rateLimit from "express-rate-limit";
import { TooManyRequestsException } from "#lib/exceptions";

// Rate limiter pour les routes d'authentification
// Maximum 5 tentatives par 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Trop de tentatives, réessayez dans 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new TooManyRequestsException("Trop de tentatives, réessayez plus tard");
  },
});

// Rate limiter général pour l'API
// Maximum 100 requêtes par 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Trop de requêtes, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
});