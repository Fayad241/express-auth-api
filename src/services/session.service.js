import prisma from "#lib/prisma";
import { NotFoundException, BadRequestException } from "#lib/exceptions";

export class SessionService {
  // Lister toutes les sessions actives
  static async getActiveSessions(userId) {
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        token: true, // Nécessaire pour identifier la session actuelle
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sessions;
  }

  /* Révoquer une session spécifique
  INTERDIT de révoquer sa propre session */
  static async revokeSession(userId, sessionId, currentRefreshToken) {
    // Trouver la session
    const session = await prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException("Session introuvable");
    }

    // Vérifier que ce n'est pas la session actuelle
    if (session.token === currentRefreshToken) {
      throw new BadRequestException(
        "Vous ne pouvez pas révoquer votre session actuelle. Utilisez la déconnexion."
      );
    }

    // Vérifier que la session n'est pas déjà révoquée
    if (session.revokedAt) {
      throw new BadRequestException("Session déjà révoquée");
    }

    // Révoquer la session
    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  // Révoquer toutes les autres sessions (sauf la session actuelle)
  static async revokeOtherSessions(userId, currentRefreshToken) {
    const result = await prisma.refreshToken.updateMany({
      where: {
        userId,
        token: { not: currentRefreshToken },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return { revokedCount: result.count };
  }
}