import { z } from "zod";

/**
 * Schéma pour vérifier l'email avec token
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token requis"),
});