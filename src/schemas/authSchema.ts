import { z } from 'zod';
import { validateCUIT } from '../utils/cuitValidator.js';

export const registerProviderSchema = z.object({
  legalName: z.string().min(1, "El nombre legal es obligatorio"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  cuit: z.string()
    .length(11, "El CUIT debe tener 11 dígitos")
    .refine((val) => validateCUIT(val), {
      message: "El CUIT no es válido matemáticamente",
    }),
});