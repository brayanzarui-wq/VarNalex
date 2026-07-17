import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const createUserSchema = z.object({
  email: z.string().email('Correo inválido').max(255),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.nativeEnum(UserRole).optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
