import { ValidationException } from "#lib/exceptions";

// Valide les données contre un schéma Zod
export function validateData(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationException(result.error.flatten().fieldErrors);
  }

  return result.data;
}