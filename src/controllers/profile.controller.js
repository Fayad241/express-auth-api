import { ProfileService } from "#services/profile.service";
import { ProfileDto } from "#dto/profile.dto";
import { validateData } from "#lib/validate";
import { updateProfileSchema } from "#schemas/profile.schema";

export class ProfileController {
  /* GET /profile
  Consulter son profil */
  static async getProfile(req, res) {
    const user = await ProfileService.getProfile(req.user.id);

    res.json({
      success: true,
      user: ProfileDto.transform(user),
    });
  }

  /* PATCH /profile
  Modifier son profil */
  static async updateProfile(req, res) {
    const validatedData = validateData(updateProfileSchema, req.body);

    const user = await ProfileService.updateProfile(req.user.id, validatedData);

    res.json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: ProfileDto.transform(user),
    });
  }

  /* DELETE /profile
  Supprimer son compte */
  static async deleteAccount(req, res) {
    await ProfileService.deleteAccount(req.user.id);

    res.json({
      success: true,
      message: "Compte supprimé avec succès",
    });
  }

  /* GET /profile/login-history
  Consulter l'historique des connexions */
  static async getLoginHistory(req, res) {
    const limit = parseInt(req.query.limit) || 20;
    const history = await ProfileService.getLoginHistory(req.user.id, limit);

    res.json({
      success: true,
      history,
    });
  }
}