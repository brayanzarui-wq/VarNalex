import { z } from 'zod';

/**
 * Validación de variables de entorno con Zod (sección 4 y 7 del contexto).
 * Se ejecuta al arrancar la app vía `ConfigModule.forRoot({ validate })`.
 * Si falta o es inválida una variable crítica, la app no arranca.
 */
export const envSchema = z.object({
  // --- Base de datos ---
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),

  // --- JWT ---
  JWT_ACCESS_SECRET: z
    .string()
    .min(16, 'JWT_ACCESS_SECRET debe tener al menos 16 caracteres'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET debe tener al menos 16 caracteres'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(30),

  // --- Cifrado de tokens de Connection (AES-256-GCM, clave de 32 bytes hex) ---
  CONNECTION_ENCRYPTION_KEY: z
    .string()
    .length(64, 'CONNECTION_ENCRYPTION_KEY debe ser hex de 64 caracteres (32 bytes)'),

  // --- Servidor ---
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),

  // --- Integraciones de terceros (opcionales hasta tener credenciales) ---
  META_APP_ID: z.string().optional().default(''),
  META_APP_SECRET: z.string().optional().default(''),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_ADS_DEVELOPER_TOKEN: z.string().optional().default(''),
  RESEND_API_KEY: z.string().optional().default(''),
  R2_ACCOUNT_ID: z.string().optional().default(''),
  R2_ACCESS_KEY_ID: z.string().optional().default(''),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(''),
  R2_BUCKET: z.string().optional().default(''),
  SENTRY_DSN: z.string().optional().default(''),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `Variables de entorno inválidas o faltantes:\n${issues}\n` +
        'Revisa apps/api/.env (usa .env.example como plantilla).',
    );
  }
  return parsed.data;
}
