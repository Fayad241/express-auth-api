import prisma from "#lib/prisma";
import { sendVerificationEmail } from "#lib/email";
import { BadRequestException, NotFoundException } from "#lib/exceptions";
import { nanoid } from "nanoid";

export class EmailService {
  /**
   * Vérifier l'email avec le token
   */
  static async verifyEmail(token) {
    // Trouver le token de vérification
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new BadRequestException("Token invalide ou expiré");
    }

    // Vérifier l'expiration
    if (new Date() > verificationToken.expiresAt) {
      throw new BadRequestException("Token expiré. Veuillez demander un nouveau lien.");
    }

    // Vérifier si l'email est déjà vérifié
    if (verificationToken.user.emailVerifiedAt) {
      throw new BadRequestException("Email déjà vérifié");
    }

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: new Date() },
    });

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { token },
    });

    return { success: true };
  }

  /**
   * Renvoyer l'email de vérification
   */
  static async resendVerificationEmail(userId) {
    // Charger l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    // Vérifier si l'email est déjà vérifié
    if (user.emailVerifiedAt) {
      throw new BadRequestException("Email déjà vérifié");
    }

    // Supprimer les anciens tokens
    await prisma.verificationToken.deleteMany({
      where: { userId },
    });

    // Créer un nouveau token
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24h

    await prisma.verificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    // Envoyer l'email
    await sendVerificationEmail(user.email, token);

    return { success: true };
  }
}