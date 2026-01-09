/* DTO pour le profil utilisateur
Filtre les données sensibles */
export class ProfileDto {
  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.emailVerifiedAt = user.emailVerifiedAt;
    this.twoFactorEnabled = !!user.twoFactorEnabledAt;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static transform(data) {
    return new ProfileDto(data);
  }
}