import { PasswordService } from "#services/password.service";
import { validateData } from "#lib/validate";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "#schemas/password.schema";

export class PasswordController {
 
  /* POST /password/forgot
    Demander la réinitialisation du mot de passe */
  static async forgotPassword(req, res) {
    const validatedData = validateData(forgotPasswordSchema, req.body);
    const { email } = validatedData;

    await PasswordService.forgotPassword(email);

    res.json({
      success: true,
      message: "Si cet email existe, un lien de réinitialisation a été envoyé",
    });
  }

  /* POST /password/reset
  Réinitialiser le mot de passe avec le token */
  static async resetPassword(req, res) {
    const validatedData = validateData(resetPasswordSchema, req.body);
    const { token, newPassword } = validatedData;

    await PasswordService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });
  }

  /* POST /password/change
  Changer le mot de passe (utilisateur connecté) */
  static async changePassword(req, res) {
    const validatedData = validateData(changePasswordSchema, req.body);
    const { currentPassword, newPassword } = validatedData;

    await PasswordService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: "Mot de passe changé avec succès",
    });
  }
}