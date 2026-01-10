import { EmailService } from "#services/email.service";
import { validateData } from "#lib/validate";
import { verifyEmailSchema } from "#schemas/email.schema";

export class EmailController {
  /**
   * GET /email/verify?token=xxx
   * Vérifier l'email avec le token
   */
  static async verifyEmail(req, res) {
    const validatedData = validateData(verifyEmailSchema, { token: req.query.token });
    const { token } = validatedData;

    await EmailService.verifyEmail(token);

    res.json({
      success: true,
      message: "Email vérifié avec succès",
    });
  }

  /**
   * POST /email/resend
   * Renvoyer l'email de vérification
   */
  static async resendVerificationEmail(req, res) {
    await EmailService.resendVerificationEmail(req.user.id);

    res.json({
      success: true,
      message: "Email de vérification envoyé",
    });
  }
}