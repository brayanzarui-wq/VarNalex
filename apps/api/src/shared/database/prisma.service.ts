import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Único punto de acceso a la base de datos.
 *
 * Regla de oro de multi-tenancy (sección 7 del contexto): ninguna consulta a
 * tablas de negocio puede omitir el filtro por `organizationId`. Este servicio
 * no impone el filtro por sí solo; cada service de dominio es responsable de
 * incluirlo en todas sus operaciones.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Conexión a PostgreSQL establecida');
    } catch (error) {
      this.logger.error(
        'No se pudo conectar a la base de datos. ¿Está configurada DATABASE_URL?',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
