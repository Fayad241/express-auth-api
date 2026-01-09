import { OAuthService } from "#services/oauth.service";
import { UserDto, AuthTokensDto } from "#dto/user.dto";

export class OAuthController {
  /* GET /oauth/google
  Redirection vers Google (géré par Passport) */
  static googleAuth() {
    // Géré par le middleware passport.authenticate
  }

  /* GET /oauth/google/callback
  Callback après authentification Google */
  static async googleCallback(req, res) {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.connection.remoteAddress;

    // req.user est défini par Passport après authentification réussie
    const { user, accessToken, refreshToken } = await OAuthService.handleOAuthCallback(
      req.user,
      userAgent,
      ipAddress
    );

    // Retourner JSON
    res.json({
      success: true,
      message: "Connexion Google réussie",
      user: UserDto.transform(user),
      tokens: new AuthTokensDto(accessToken, refreshToken),
    });
  }
}