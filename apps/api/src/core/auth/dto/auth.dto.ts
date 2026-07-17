import { z } from 'zod';

export const registerSchema = z.object({
  organizationName: z
    .string()
    .min(2, 'El nombre de la organización es muy corto')
    .max(120),
  email: z.string().email('Correo inválido').max(255),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Correo inválido').max(255),
  password: z.string().min(1, 'La contraseña es obligatoria').max(128),
});
export type LoginDto = z.infer<typeof loginSchema>;
