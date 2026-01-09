import prisma from "#lib/prisma";
import {
  generateTwoFactorSecret,
  generateTwoFactorUrl,
  generateQRCode,
  verifyTwoFactorToken,
} from "#lib/two-factor";
import { signAccessToken, signRefreshToken } from "#lib/jwt";
import { UnauthorizedException, BadRequestException } from "#lib/exceptions";

export class TwoFactorService {
  // Activer le 2FA (génère le secret et le QR code)
  static async enableTwoFactor(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException("Utilisateur non trouvé");
    }

    if (user.twoFactorEnabledAt) {
      throw new BadRequestException("Le 2FA est déjà activé");
    }

    // Générer le secret
    const secret = generateTwoFactorSecret();

    // Générer l'URL otpauth
    const otpauthUrl = generateTwoFactorUrl(user.email, secret);

    // Générer le QR code
    const qrCode = await generateQRCode(otpauthUrl);

    // Stocker le secret temporairement (sera confirmé après vérification)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return { secret, qrCode };
  }

  // Vérifier le code 2FA et finaliser l'activation
  static async verifyAndActivateTwoFactor(userId, code) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException("Le 2FA n'a pas été initialisé");
    }

    if (user.twoFactorEnabledAt) {
      throw new BadRequestException("Le 2FA est déjà activé");
    }

    // Vérifier le code
    const isValid = verifyTwoFactorToken(code, user.twoFactorSecret);

    if (!isValid) {
      throw new UnauthorizedException("Code 2FA invalide");
    }

    // Activer le 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabledAt: new Date() },
    });

    return { success: true };
  }

  // Désactiver le 2FA
  static async disableTwoFactor(userId, code) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorEnabledAt) {
      throw new BadRequestException("Le 2FA n'est pas activé");
    }

    // Vérifier le code avant de désactiver
    const isValid = verifyTwoFactorToken(code, user.twoFactorSecret);

    if (!isValid) {
      throw new UnauthorizedException("Code 2FA invalide");
    }

    // Désactiver le 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabledAt: null,
      },
    });

    return { success: true };
  }

  // Valider le code 2FA lors de la connexion
  static async validateTwoFactorLogin(userId, code, userAgent, ipAddress) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorEnabledAt) {
      throw new BadRequestException("Le 2FA n'est pas activé pour cet utilisateur");
    }

    // Vérifier le code
    const isValid = verifyTwoFactorToken(code, user.twoFactorSecret);

    if (!isValid) {
      throw new UnauthorizedException("Code 2FA invalide");
    }

    // Générer les tokens
    const accessToken = await signAccessToken({ userId: user.id });
    const refreshToken = await signRefreshToken({ userId: user.id });

    // Stocker le refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
        userAgent,
        ipAddress,
      },
    });

    return { user, accessToken, refreshToken };
  }
}