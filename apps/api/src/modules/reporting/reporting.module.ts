import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections/connections.controller';
import { ConnectionsService } from './connections/connections.service';
import { GoogleAdsService } from './connections/google-ads.service';
import { GoogleAnalyticsService } from './connections/google-analytics.service';
import { MetaAdsService } from './connections/meta-ads.service';
import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';

/**
 * Módulo de negocio: Reportes Automáticos para agencias de marketing digital.
 *
 * Único módulo de negocio activo (sección 1). Importa de `core/` y `shared/`,
 * nunca de otro módulo de negocio (sección 5). PrismaService, CryptoService,
 * AuditLogService y el registro de módulos son globales y se inyectan sin
 * importarlos aquí.
 */
@Module({
  controllers: [ConnectionsController, ReportsController],
  providers: [
    ConnectionsService,
    ReportsService,
    MetaAdsService,
    GoogleAdsService,
    GoogleAnalyticsService,
  ],
})
export class ReportingModule {}
