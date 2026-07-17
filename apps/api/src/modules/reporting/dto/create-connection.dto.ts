import { z } from 'zod';
import { ConnectionProvider } from '@prisma/client';

export const createConnectionSchema = z.object({
  provider: z.nativeEnum(ConnectionProvider),
  // Token OAuth entregado por el proveedor tras el flujo de conexión.
  accessToken: z.string().min(1, 'accessToken es obligatorio'),
  refreshToken: z.string().min(1).optional(),
  // Id de la cuenta publicitaria / propiedad en el proveedor.
  externalId: z.string().min(1).optional(),
});

export type CreateConnectionDto = z.infer<typeof createConnectionSchema>;
