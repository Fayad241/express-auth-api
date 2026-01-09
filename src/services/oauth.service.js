import prisma from "#lib/prisma";
import { signAccessToken, signRefreshToken } from "#lib/jwt";

export class OAuthService {
  // Finaliser la connexion OAuth et générer les tokens
  static async handleOAuthCallback(user, userAgent, ipAddress) {
    // Enregistrer dans l'historique
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        success: true,
        ipAddress,
        userAgent,
      },
    });

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