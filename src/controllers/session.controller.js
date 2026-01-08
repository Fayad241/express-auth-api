import prisma from "#lib/prisma";

export class SessionController {

  // GET /sessions
  static async getSessions(req, res) {
    const sessions = await prisma.refreshToken.findMany({
      where: {
        userId: req.user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true
      }
    });

    res.json({
      success: true,
      sessions
    });
  }

  // DELETE /sessions/:id
  static async revokeSession(req, res) {
    const { id } = req.params;

    const session = await prisma.refreshToken.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session introuvable"
      });
    }

    await prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() }
    });

    res.json({
      success: true,
      message: "Session révoquée"
    });
  }

  // DELETE /sessions
  static async revokeOtherSessions(req, res) {
    const currentToken = req.body.refreshToken;

    await prisma.refreshToken.updateMany({
      where: {
        userId: req.user.id,
        token: { not: currentToken },
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: "Toutes les autres sessions ont été révoquées"
    });
  }
}
