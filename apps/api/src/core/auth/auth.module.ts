import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Módulo de autenticación del núcleo: registro, login, rotación de refresh
 * tokens y validación de JWT.
 *
 * DatabaseModule, CryptoModule, AuditLogModule y ModuleRegistryModule son
 * globales, por lo que sus servicios se inyectan sin importarlos aquí.
 */
@Module({
  imports: [
    PassportModule,
    // El secreto y la expiración se pasan por firma en cada token (ver
    // AuthService), por lo que aquí basta con registrar el módulo.
    JwtModule.register({}),
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
