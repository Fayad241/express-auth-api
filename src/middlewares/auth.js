import { verifyAccessToken } from "#lib/jwt";
import { UnauthorizedException } from "#lib/exceptions";
import prisma from "#lib/prisma";

// Middleware d'authentification
// Vérifie le token JWT et charge l'utilisateur dans req.user
export async function authenticate(req, res, next) {
  try {
    // Récupérer le token depuis l'header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token manquant");
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier si le token est blacklisté
    const isBlacklisted = await prisma.blacklistedAccessToken.findUnique({
      where: { token },
    });

    if (isBlacklisted) {
      throw new UnauthorizedException("Token révoqué");
    }

    // Vérifier et décoder le token
    const payload = await verifyAccessToken(token);

    // Charger l'utilisateur depuis la DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException("Utilisateur non trouvé");
    }

    // Vérifier si le compte est désactivé
    if (user.disabledAt) {
      throw new UnauthorizedException("Compte désactivé");
    }

    // Attacher l'utilisateur et le token à la requête
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
}

// Middleware optionnel : authentification si token présent
export async function authenticateOptional(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Pas de token, continue sans utilisateur
    }

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (user && !user.disabledAt) {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    next(); // En cas d'erreur, continue sans utilisateur
  }
}

// Middleware : vérifie que l'email est vérifié
export function requireEmailVerified(req, res, next) {
  if (!req.user.emailVerifiedAt) {
    throw new UnauthorizedException("Email non vérifié");
  }
  next();
}