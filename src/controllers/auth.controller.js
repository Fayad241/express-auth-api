import { AuthService } from "#services/auth.service";
import { UserDto, AuthTokensDto } from "#dto/user.dto";
import { validateData } from "#lib/validate";
import { registerSchema, loginSchema, refreshTokenSchema } from "#schemas/auth.schema";

export class AuthController {
  /* POST /auth/register
  Inscription d'un nouvel utilisateur */
  static async register(req, res) {
    const validatedData = validateData(registerSchema, req.body);
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.connection.remoteAddress;

    const { user, accessToken, refreshToken } = await AuthService.register(
      validatedData,
      userAgent,
      ipAddress
    );

    res.status(201).json({
      success: true,
      message: "Inscription réussie. Veuillez vérifier votre email.",
      user: UserDto.transform(user),
      tokens: new AuthTokensDto(accessToken, refreshToken),
    });
  }

  /* POST /auth/login
  Connexion d'un utilisateur */
  static async login(req, res) {
    const validatedData = validateData(loginSchema, req.body);
    const { email, password } = validatedData;
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await AuthService.login(email, password, userAgent, ipAddress);

    // Si 2FA activé
    if (result.requires2FA) {
      return res.json({
        success: true,
        message: "Veuillez entrer votre code 2FA",
        requires2FA: true,
        userId: result.user.id, // Temporaire pour la validation 2FA
      });
    }

    // Connexion normale
    res.json({
      success: true,
      message: "Connexion réussie",
      user: UserDto.transform(result.user),
      tokens: new AuthTokensDto(result.accessToken, result.refreshToken),
    });
  }

  /* POST /auth/logout
  Déconnexion (révoque les tokens) */
  static async logout(req, res) {
    const refreshToken = req.body.refreshToken;
    const accessToken = req.token; // Vient du middleware authenticate

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token requis",
      });
    }

    await AuthService.logout(refreshToken, accessToken);

    res.json({
      success: true,
      message: "Déconnexion réussie",
    });
  }

  /* POST /auth/refresh
   Rafraîchir les tokens */
  static async refresh(req, res) {
    const validatedData = validateData(refreshTokenSchema, req.body);
    const { refreshToken } = validatedData;
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.connection.remoteAddress;

    const { user, accessToken, refreshToken: newRefreshToken } = 
      await AuthService.refreshTokens(refreshToken, userAgent, ipAddress);

    res.json({
      success: true,
      message: "Tokens rafraîchis",
      user: UserDto.transform(user),
      tokens: new AuthTokensDto(accessToken, newRefreshToken),
    });
  }
}