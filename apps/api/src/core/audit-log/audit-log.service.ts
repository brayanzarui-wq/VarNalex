import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma.service';

export interface AuditEntry {
  organizationId: string;
  userId?: string | null;
  action: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Registro de auditoría del núcleo. Cualquier módulo (core o de negocio) puede
 * registrar acciones sensibles. Escribir en el log nunca debe tumbar la
 * operación principal, por eso los errores se atrapan y se loguean.
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          organizationId: entry.organizationId,
          userId: entry.userId ?? null,
          action: entry.action,
          metadata: entry.metadata,
        },
      });
    } catch (error) {
      this.logger.error(
        `No se pudo registrar auditoría para acción "${entry.action}"`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /** Lista los últimos eventos de auditoría de una organización. */
  async listForOrganization(organizationId: string, take = 50) {
    return this.prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
