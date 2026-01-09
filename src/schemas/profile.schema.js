import { z } from "zod";

/* Schéma pour mettre à jour le profil
Tous les champs sont optionnels */
export const updateProfileSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").optional(),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  email: z.string().email("Email invalide").optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Au moins un champ doit être fourni pour la mise à jour" }
);