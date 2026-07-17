import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

/**
 * Módulos activados por defecto al crear una organización.
 *
 * Son claves opacas (datos, no código): `core/` no importa ni conoce la
 * implementación de ningún módulo de negocio, solo administra su bandera. Al
 * incorporar un módulo 2 en el futuro, se agrega su clave aquí (o se expone por
 * configuración) sin tocar el schema.
 */
export const DEFAULT_MODULE_KEYS = ['reporting'] as const;

/**
 * Sistema de feature flags por organización (sección 5, regla 4 del contexto).
 * Cada organización tiene una fila en `ModuleActivation` por módulo activo.
 *
 * `core/` no conoce los módulos de negocio: los módulos se identifican por una
 * clave string (`moduleKey`, p. ej. "reporting"). Cuando exista un módulo 2, no
 * se toca el schema, solo se agregan filas con otra clave.
 */
@Injectable()
export class ModuleRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  /** Activa los módulos por defecto para una organización recién creada. */
  async activateDefaults(organizationId: string): Promise<void> {
    for (const moduleKey of DEFAULT_MODULE_KEYS) {
      await this.activate(organizationId, moduleKey);
    }
  }

  async isActive(organizationId: string, moduleKey: string): Promise<boolean> {
    const activation = await this.prisma.moduleActivation.findUnique({
      where: {
        organizationId_moduleKey: { organizationId, moduleKey },
      },
    });
    return Boolean(activation?.isActive);
  }

  /** Activa un módulo para una organización (idempotente). */
  async activate(organizationId: string, moduleKey: string) {
    return this.prisma.moduleActivation.upsert({
      where: {
        organizationId_moduleKey: { organizationId, moduleKey },
      },
      create: { organizationId, moduleKey, isActive: true },
      update: { isActive: true },
    });
  }

  async deactivate(organizationId: string, moduleKey: string) {
    return this.prisma.moduleActivation.updateMany({
      where: { organizationId, moduleKey },
      data: { isActive: false },
    });
  }

  async listActive(organizationId: string) {
    return this.prisma.moduleActivation.findMany({
      where: { organizationId, isActive: true },
      select: { moduleKey: true, activatedAt: true },
    });
  }
}
