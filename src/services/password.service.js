import prisma from "#lib/prisma";
import { hashPassword, verifyPassword } from "#lib/password";
import { sendPasswordResetEmail } from "#lib/email";
import { NotFoundException, UnauthorizedException, BadRequestException } from "#lib/exceptions";
import { nanoid } from "nanoid";

export class PasswordService {

  /* Demander la réinitialisation du mot de passe
    Envoie un email avec un token */
  static async forgotPassword(email) {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });

    // Ne pas révéler si l'email existe ou non (sécurité)
    if (!user) {
      return { success: true };
    }

    // Supprimer les anciens tokens de réinitialisation
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Créer un nouveau token
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expire dans 1 heure

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Envoyer l'email
    // await sendPasswordResetEmail(user.email, token);

    return { success: true };
  }

  // Réinitialiser le mot de passe avec le token
  static async resetPassword(token, newPassword) {
    // Trouver le token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException("Token invalide ou expiré");
    }

    // Vérifier l'expiration
    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException("Token expiré");
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Supprimer le token utilisé
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    // Révoquer tous les refresh tokens de l'utilisateur (sécurité)
    await prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  // Changer le mot de passe (utilisateur connecté)
  static async changePassword(userId, currentPassword, newPassword) {
    // Charger l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await verifyPassword(user.password, currentPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Mot de passe actuel incorrect");
    }

    // Vérifier que le nouveau mot de passe est différent
    const isSamePassword = await verifyPassword(user.password, newPassword);
    if (isSamePassword) {
      throw new BadRequestException("Le nouveau mot de passe doit être différent de l'ancien");
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    // Mettre à jour
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Révoque tous les refresh tokens de l'utilisateur (y compris la session actuelle)
    // Choix de sécurité : l'utilisateur devra se reconnecter
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }
}