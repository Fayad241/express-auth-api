import { SignJWT, jwtVerify } from "jose";

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
const alg = "HS256";

// Génère un Access Token
export async function signAccessToken(payload) {
  // Ajouter du padding pour atteindre 1024 caractères minimum
  const paddingLength = 800; 
  const padding = "x".repeat(paddingLength);
  
  return new SignJWT({ ...payload, _padding: padding })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecret);
}

// Génère un Refresh Token
export async function signRefreshToken(payload) {

  const paddingLength = 800; // Assure 1024+ caractères
  const padding = "x".repeat(paddingLength);
  
  return new SignJWT({ ...payload, _padding: padding })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshSecret);
}

// Vérifie un Access Token
export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, accessSecret);

  // Retirer le padding avant de retourner
  const { _padding, ...cleanPayload } = payload;
  return cleanPayload;
}

// Vérifie un Refresh Token
export async function verifyRefreshToken(token) {
  const { payload } = await jwtVerify(token, refreshSecret);
  
  // Retirer le padding avant de retourner
  const { _padding, ...cleanPayload } = payload;
  return cleanPayload;
}

// Décode un token sans le vérifier (pour récupérer l'expiration)
export function decodeToken(token) {
  const [, payloadBase64] = token.split(".");
  const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
  return payload;
}