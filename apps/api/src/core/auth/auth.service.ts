import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';
import { CryptoService } from '../../shared/crypto/crypto.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ModuleRegistryService } from '../module-registry/module-registry.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './auth.types';
import { LoginDto, RegisterDto } from './dto/auth.dto';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
  refreshExpiresAt: Date;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    role: User['role'];
    organizationId: string;
  };
  tokens: IssuedTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly organizations: OrganizationsService,
    private readonly moduleRegistry: ModuleRegistryService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly crypto: CryptoService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Registro: crea la organización, su primer usuario ADMIN y activa los
   * módulos por defecto. Devuelve tokens de sesión.
   */
  async register(dto: RegisterDto): Promise<AuthResult> {
    const org = await this.organizations.create(dto.organizationName);
    const user = await this.users.create({
      email: dto.email,
      password: dto.password,
      organizationId: org.id,
      // El primer usuario de una organización es su administrador.
      role: 'ADMIN',
    });

    await this.moduleRegistry.activateDefaults(org.id);

    await this.auditLog.record({
      organizationId: org.id,
      userId: user.id,
      action: 'auth.register',
      metadata: { email: user.email },
    });

    const tokens = await this.issueTokens(user);
    return { user: this.toPublicUser(user), tokens };
  }

  /** Login por correo + contraseña. */
  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findByEmail(dto.email);
    // Mensaje genérico para no revelar si el correo existe.
    const invalid = new UnauthorizedException('Credenciales inválidas');
    if (!user) {
      throw invalid;
    }
    const ok = await this.users.verifyPassword(dto.password, user.passwordHash);
    if (!ok) {
      throw invalid;
    }

    await this.auditLog.record({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'auth.login',
    });

    const tokens = await this.issueTokens(user);
    return { user: this.toPublicUser(user), tokens };
  }

  /**
   * Rotación de refresh token: valida el token entrante contra la BD, lo revoca
   * y emite un par nuevo. Refresh tokens rotativos con revocación (sección 7).
   */
  async refresh(rawRefreshToken: string): Promise<AuthResult> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Falta el refresh token');
    }
    const hashed = this.crypto.hash(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: hashed },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Revoca el token usado (rotación).
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const tokens = await this.issueTokens(stored.user);
    return { user: this.toPublicUser(stored.user), tokens };
  }

  /** Cierra sesión revocando el refresh token presentado. */
  async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;
    const hashed = this.crypto.hash(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { token: hashed, revoked: false },
      data: { revoked: true },
    });
  }

  // --- helpers privados ---

  private async issueTokens(user: User): Promise<IssuedTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    };

    const accessExpiresIn = this.config.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '24h',
    );
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      // `expiresIn` acepta formatos como "24h"; el tipo StringValue de `ms`
      // no lo infiere desde un string genérico, de ahí el cast.
      expiresIn: accessExpiresIn as unknown as number,
    });

    // Refresh token opaco; en BD se guarda solo su hash.
    const rawRefreshToken = this.crypto.randomToken();
    const days = this.config.get<number>('JWT_REFRESH_EXPIRES_IN_DAYS', 30);
    const refreshExpiresAt = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refreshToken.create({
      data: {
        token: this.crypto.hash(rawRefreshToken),
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      accessExpiresIn,
      refreshExpiresAt,
    };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
  }
}
