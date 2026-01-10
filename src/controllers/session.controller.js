import { SessionService } from "#services/session.service";
import { SessionDto } from "#dto/session.dto";
import { BadRequestException } from "#lib/exceptions";

export class SessionController {
  /* GET /sessions
  Lister toutes les sessions actives */
  static async getSessions(req, res) {
    // Récupérer le refresh token depuis query, body ou header (dans cet ordre)
    const currentRefreshToken = 
      req.query.refreshToken || 
      req.body.refreshToken || 
      req.headers['x-refresh-token'];

    if (!currentRefreshToken) {
      throw new BadRequestException("Refresh token requis pour identifier la session actuelle");
    }

    const sessions = await SessionService.getActiveSessions(req.user.id);

    res.json({
      success: true,
      sessions: SessionDto.transform(sessions, currentRefreshToken),
      total: sessions.length,
    });
  }

  /* DELETE /sessions/:id
  Révoquer une session spécifique */
  static async revokeSession(req, res) {
    const { id } = req.params;
    const currentRefreshToken = req.body.refreshToken;

    if (!currentRefreshToken) {
      throw new BadRequestException("Refresh token requis");
    }

    await SessionService.revokeSession(req.user.id, id, currentRefreshToken);

    res.json({
      success: true,
      message: "Session révoquée avec succès",
    });
  }

  /* DELETE /sessions/others
  Révoquer toutes les autres sessions */
  static async revokeOtherSessions(req, res) {
    const currentRefreshToken = req.body.refreshToken;

    if (!currentRefreshToken) {
      throw new BadRequestException("Refresh token requis");
    }

    const result = await SessionService.revokeOtherSessions(req.user.id, currentRefreshToken);

    res.json({
      success: true,
      message: `${result.revokedCount} session(s) révoquée(s)`,
    });
  }
}