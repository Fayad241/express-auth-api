import prisma from "#lib/prisma";
import { ConflictException, NotFoundException } from "#lib/exceptions";

export class ProfileService {
  // Récupérer le profil utilisateur
  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    return user;
  }

  // Mettre à jour le profil
  static async updateProfile(userId, data) {
    const { email, firstName, lastName } = data;

    // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      // Si l'email existe et n'appartient pas à l'utilisateur actuel
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException("Cet email est déjà utilisé");
      }

      // Si l'email change, révoquer la vérification
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (currentUser.email !== email) {
        data.emailVerifiedAt = null; // L'utilisateur devra re-vérifier son email
      }
    }

    // Mettre à jour
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        ...(data.emailVerifiedAt !== undefined && { emailVerifiedAt: data.emailVerifiedAt }),
      },
    });

    return updatedUser;
  }

  // Supprimer le compte (soft delete)
  static async deleteAccount(userId) {
    // Désactiver le compte
    await prisma.user.update({
      where: { id: userId },
      data: { disabledAt: new Date() },
    });

    // Révoquer tous les refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  // Récupérer l'historique des connexions
  static async getLoginHistory(userId, limit = 20) {
    const history = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return history;
  }
}