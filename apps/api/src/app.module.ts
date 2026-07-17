import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- shared (infraestructura global) ---
import { DatabaseModule } from './shared/database/database.module';
import { CryptoModule } from './shared/crypto/crypto.module';
import { validateEnv } from './shared/config/env.validation';

// --- core ---
import { AuthModule } from './core/auth/auth.module';
import { JwtAuthGuard } from './core/auth/guards/jwt-auth.guard';
import { UsersModule } from './core/users/users.module';
import { OrganizationsModule } from './core/organizations/organizations.module';
import { ModuleRegistryModule } from './core/module-registry/module-registry.module';
import { AuditLogModule } from './core/audit-log/audit-log.module';
import { BillingModule } from './core/billing/billing.module';

// --- modules de negocio ---
import { ReportingModule } from './modules/reporting/reporting.module';

@Module({
  imports: [
    // Configuración validada con Zod; global para toda la app.
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Rate limiting global por defecto (sección 7). Endpoints sensibles
    // refinan el límite con @Throttle.
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 120 },
    ]),

    // Infra global compartida.
    DatabaseModule,
    CryptoModule,

    // Core.
    AuditLogModule,
    ModuleRegistryModule,
    OrganizationsModule,
    UsersModule,
    AuthModule,
    BillingModule,

    // Módulos de negocio.
    ReportingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // JWT obligatorio por defecto; los endpoints públicos usan @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Rate limiting aplicado globalmente.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
