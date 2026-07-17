import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  ACCESS_TOKEN_COOKIE,
  AuthenticatedUser,
  JwtPayload,
} from '../auth.types';

/**
 * Estrategia de validación del access token JWT.
 *
 * El token se lee primero de la cookie httpOnly `access_token` (sección 10:
 * no usar localStorage para tokens sensibles) y, como alternativa para clientes
 * no-navegador, del header Authorization Bearer.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = (req?.cookies ?? {}) as Record<string, string>;
          return cookies[ACCESS_TOKEN_COOKIE] ?? null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload?.sub || !payload?.organizationId) {
      throw new UnauthorizedException('Token inválido');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      role: payload.role,
    };
  }
}
