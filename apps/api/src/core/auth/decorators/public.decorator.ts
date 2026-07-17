import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como público (sin requerir JWT). Útil cuando JwtAuthGuard
 * se aplica de forma global. Uso: `@Public()`.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
