// DTO pour filtrer les données utilisateur
export class UserDto {
  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.emailVerifiedAt = user.emailVerifiedAt;
    this.twoFactorEnabledAt = user.twoFactorEnabledAt;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  // Transforme un utilisateur ou une liste d'utilisateurs
  static transform(data) {
    if (Array.isArray(data)) {
      return data.map((user) => new UserDto(user));
    }
    return new UserDto(data);
  }
}

// DTO pour les tokens d'authentification
export class AuthTokensDto {
  constructor(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenType = "Bearer";
    this.expiresIn = 900; // 15 minutes en secondes
  }
}