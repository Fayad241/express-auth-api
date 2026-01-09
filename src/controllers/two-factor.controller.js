import { TwoFactorService } from "#services/two-factor.service";
import { TwoFactorSetupDto } from "#dto/two-factor.dto";
import { UserDto, AuthTokensDto } from "#dto/user.dto";
import { validateData } from "#lib/validate";
import { verifyTwoFactorSchema, validateTwoFactorLoginSchema } from "#schemas/two-factor.schema";

export class TwoFactorController {
  /* POST /2fa/enable
  Activer le 2FA (génère QR code) */
  static async enable(req, res) {
    const { secret, qrCode } = await TwoFactorService.enableTwoFactor(req.user.id);

    res.json({
      success: true,
      message: "Scannez le QR code avec votre application d'authentification",
      data: new TwoFactorSetupDto(secret, qrCode),
    });
  }

  /* POST /2fa/verify
  Vérifier le code et activer définitivement le 2FA */
  static async verify(req, res) {
    const validatedData = validateData(verifyTwoFactorSchema, req.body);
    const { code } = validatedData;

    await TwoFactorService.verifyAndActivateTwoFactor(req.user.id, code);

    res.json({
      success: true,
      message: "2FA activé avec succès",
    });
  }

  /* POST /2fa/disable
  Désactiver le 2FA */
  static async disable(req, res) {
    const validatedData = validateData(verifyTwoFactorSchema, req.body);
    const { code } = validatedData;

    await TwoFactorService.disableTwoFactor(req.user.id, code);

    res.json({
      success: true,
      message: "2FA désactivé avec succès",
    });
  }

  /* POST /2fa/validate
  Valider le code 2FA lors de la connexion */
  static async validate(req, res) {
    const validatedData = validateData(validateTwoFactorLoginSchema, req.body);
    const { userId, code } = validatedData;
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.connection.remoteAddress;

    const { user, accessToken, refreshToken } = await TwoFactorService.validateTwoFactorLogin(
      userId,
      code,
      userAgent,
      ipAddress
    );

    res.json({
      success: true,
      message: "Connexion réussie",
      user: UserDto.transform(user),
      tokens: new AuthTokensDto(accessToken, refreshToken),
    });
  }
}