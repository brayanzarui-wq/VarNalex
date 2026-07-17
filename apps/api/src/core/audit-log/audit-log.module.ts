import { Global, Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';

/**
 * Global: la auditoría es transversal y la usan varios módulos de core y de
 * negocio sin necesidad de reimportarla.
 */
@Global()
@Module({
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
