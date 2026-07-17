import { UserRole } from '@prisma/client';

/** Payload que se firma dentro del access token JWT. */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  organizationId: string;
  role: UserRole;
}

/**
 * Forma del usuario autenticado que se adjunta a `request.user` tras validar
 * el JWT. Es la unidad que consumen guards, decoradores y controladores.
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  organizationId: string;
  role: UserRole;
}

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
