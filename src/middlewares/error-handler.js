import { HttpException } from "#lib/exceptions";
import { logger } from "#lib/logger";

export function errorHandler(err, req, res, next) {
  // Log de l'erreur
  if (err instanceof HttpException) {
    logger.warn({ err, path: req.path }, err.message);
  } else {
    logger.error({ err, path: req.path }, "Unhandled error");
  }

  // Erreurs HTTP personnalisées
  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Erreurs Prisma
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: "Cette ressource existe déjà",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      error: "Ressource non trouvée",
    });
  }

  // Erreurs JWT de jose
  if (err.code === "ERR_JWT_EXPIRED") {
    return res.status(401).json({
      success: false,
      error: "Token expiré",
    });
  }

  if (err.code === "ERR_JWS_INVALID" || err.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
    return res.status(401).json({
      success: false,
      error: "Token invalide",
    });
  }

  // Erreur JSON mal formaté
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      success: false,
      error: "JSON invalide",
    });
  }

  // Erreur générique
  const isProduction = process.env.NODE_ENV === "production";

  res.status(500).json({
    success: false,
    error: isProduction ? "Erreur interne du serveur" : err.message,
    ...(!isProduction && { stack: err.stack }),
  });
}