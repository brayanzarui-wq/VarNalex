import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ReportStatus } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { ConnectionsService } from '../connections/connections.service';
import { CreateReportDto } from '../dto/create-report.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly connections: ConnectionsService,
  ) {}

  /** Lista reportes de la organización, con datos básicos de la conexión. */
  async list(organizationId: string) {
    return this.prisma.report.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        connection: { select: { provider: true, externalId: true } },
      },
    });
  }

  async getById(organizationId: string, reportId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, organizationId },
      include: {
        connection: { select: { provider: true, externalId: true } },
      },
    });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }
    return report;
  }

  /**
   * Crea un reporte en estado PENDING. La conexión debe pertenecer a la misma
   * organización (multi-tenancy estricto).
   */
  async create(organizationId: string, dto: CreateReportDto) {
    const connection = await this.prisma.connection.findFirst({
      where: { id: dto.connectionId, organizationId, isActive: true },
    });
    if (!connection) {
      throw new NotFoundException('Conexión no encontrada o inactiva');
    }

    const report = await this.prisma.report.create({
      data: {
        organizationId,
        connectionId: connection.id,
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
        status: ReportStatus.PENDING,
      },
    });

    // La generación real (fetch de métricas + PDF) se dispara aparte.
    return report;
  }

  /**
   * Genera el reporte: obtendría métricas del proveedor y produciría el PDF.
   *
   * TODO(reporting): la generación de PDF requiere decidir la librería
   * (sección 9, punto 5: preguntar antes de elegir). Por ahora se marca el
   * estado como FAILED con nota, para no simular un PDF inexistente.
   */
  async generate(organizationId: string, reportId: string) {
    const report = await this.getById(organizationId, reportId);

    try {
      // TODO(reporting): descifrar tokens y llamar al proveedor.
      // const tokens = await this.connections.getDecryptedTokens(
      //   organizationId, report.connectionId);
      // const client = this.connections.resolveClient(report.connection.provider);
      // const metrics = await client.fetchMetrics(tokens.accessToken, {...});
      // TODO(reporting): renderizar PDF y subirlo a Cloudflare R2 -> pdfUrl.
      this.logger.warn(
        `Generación de reporte ${reportId} no implementada (falta librería de PDF y credenciales de proveedor)`,
      );

      return this.prisma.report.update({
        where: { id: report.id },
        data: { status: ReportStatus.PENDING },
      });
    } catch (error) {
      this.logger.error(
        `Error generando reporte ${reportId}`,
        error instanceof Error ? error.stack : undefined,
      );
      return this.prisma.report.update({
        where: { id: report.id },
        data: { status: ReportStatus.FAILED },
      });
    }
  }

  /**
   * Reenvía un reporte generado al cliente por email.
   *
   * TODO(reporting): integrar Resend para el envío real. Marca SENT solo cuando
   * el envío ocurra de verdad.
   */
  async resend(organizationId: string, reportId: string) {
    const report = await this.getById(organizationId, reportId);
    // TODO(reporting): enviar `report.pdfUrl` por email vía Resend.
    this.logger.warn(
      `Reenvío de reporte ${reportId} no implementado (falta integración con Resend)`,
    );
    return report;
  }
}
