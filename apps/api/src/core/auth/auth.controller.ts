import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService, IssuedTokens } from './auth.service';
import {
  ACCESS_TOKEN_COOKIE,
  AuthenticatedUser,
  REFRESH_TOKEN_COOKIE,
} from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto, loginSchema, RegisterDto, registerSchema } from './dto/auth.dto';
import { ZodValidationPipe } from '../../shared/validation/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  // Rate limiting en endpoints sensibles (sección 7): 5 registros / minuto.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(body);
    this.setAuthCookies(res, result.tokens);
    return { user: result.user };
  }

  @Public()
  // Rate limiting estricto en login (sección 7): 5 intentos / minuto.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(body);
    this.setAuthCookies(res, result.tokens);
    return { user: result.user };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = this.readCookie(req, REFRESH_TOKEN_COOKIE);
    if (!token) {
      throw new UnauthorizedException('Falta el refresh token');
    }
    const result = await this.auth.refresh(token);
    this.setAuthCookies(res, result.tokens);
    return { user: result.user };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = this.readCookie(req, REFRESH_TOKEN_COOKIE);
    await this.auth.logout(token);
    this.clearAuthCookies(res);
    return { success: true };
  }

  /** Usuario de la sesión actual (requiere JWT válido). */
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  // --- cookies httpOnly (sección 10: no localStorage para tokens) ---

  private isProduction(): boolean {
    return this.config.get<string>('NODE_ENV') === 'production';
  }

  private setAuthCookies(res: Response, tokens: IssuedTokens): void {
    const secure = this.isProduction();
    const common = {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      ...common,
      maxAge: 24 * 60 * 60 * 1000, // 24h, alineado con la expiración del JWT
    });
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...common,
      expires: tokens.refreshExpiresAt,
    });
  }

  private clearAuthCookies(res: Response): void {
    const opts = {
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: 'lax' as const,
      path: '/',
    };
    res.clearCookie(ACCESS_TOKEN_COOKIE, opts);
    res.clearCookie(REFRESH_TOKEN_COOKIE, opts);
  }

  private readCookie(req: Request, name: string): string | undefined {
    const cookies = (req.cookies ?? {}) as Record<string, string>;
    return cookies[name];
  }
}
