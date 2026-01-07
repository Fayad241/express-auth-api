import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

// Imports
import { logger, httpLogger } from "#lib/logger";
import { errorHandler } from "#middlewares/error-handler";
import { notFoundHandler } from "#middlewares/not-found";
import { apiLimiter } from "#lib/rate-limiter";
import routes from "#routes/index";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de sécurité
app.use(helmet());
app.use(cors());

// Logging HTTP
app.use(httpLogger);

// Parser JSON
app.use(express.json());

// Rate limiting global
app.use(apiLimiter);

// Route de santé
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Express Auth opérationnelle",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
  });
});

// Monter toutes les routes de l'API
app.use("/api", routes);

// Gestion 404
app.use(notFoundHandler);

// Gestion globale des erreurs
app.use(errorHandler);

// Démarrer le serveur
app.listen(PORT, () => {
  logger.info(`Serveur démarré sur http://localhost:${PORT}`);
  logger.info(`Documentation API : http://localhost:${PORT}/api`);
  logger.info(`Health check : http://localhost:${PORT}/health`);
});