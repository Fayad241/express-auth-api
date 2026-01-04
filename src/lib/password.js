import argon2 from "argon2";

// Hash un mot de passe avec Argon2
export async function hashPassword(password) {
  return argon2.hash(password);
}

// Vérifie un mot de passe contre son hash
export async function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}