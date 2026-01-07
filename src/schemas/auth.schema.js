import { z } from "zod";

// Schéma pour l'inscription
export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").optional(),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
});

// Schéma pour la connexion
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// Schéma pour le refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token requis"),
});