import { z } from "zod";

// Schéma pour vérifier un code 2FA
export const verifyTwoFactorSchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d+$/, "Le code doit contenir uniquement des chiffres"),
});

// Schéma pour valider le code 2FA lors de la connexion
export const validateTwoFactorLoginSchema = z.object({
  userId: z.string().min(1, "User ID requis"),
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d+$/, "Le code doit contenir uniquement des chiffres"),
});