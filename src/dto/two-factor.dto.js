// DTO pour l'activation du 2FA
export class TwoFactorSetupDto {
  constructor(secret, qrCode) {
    this.secret = secret;
    this.qrCode = qrCode;
  }
}