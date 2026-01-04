import { authenticator } from "otplib";
import QRCode from "qrcode";

// Génère un secret 2FA pour un utilisateur
export function generateTwoFactorSecret() {
  return authenticator.generateSecret();
}

// Génère l'URL otpauth pour le QR code
export function generateTwoFactorUrl(email, secret) {
  const appName = "Express Auth API";
  return authenticator.keyuri(email, appName, secret);
}

// Génère un QR code en base64
export async function generateQRCode(otpauthUrl) {
  return QRCode.toDataURL(otpauthUrl);
}

// Vérifie un code 2FA
export function verifyTwoFactorToken(token, secret) {
  return authenticator.verify({ token, secret });
}