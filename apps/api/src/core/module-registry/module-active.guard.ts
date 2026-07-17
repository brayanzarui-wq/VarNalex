import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../auth/auth.types';
import { REQUIRE_MODULE_KEY } from './require-module.decorator';
import { ModuleRegistryService } from './module-registry.service';

/**
 * Guard que hace cumplir la regla 4 de la sección 5: toda ruta de un módulo de
 * negocio debe verificar que la organización tenga ese módulo activo antes de
 * responder. Vive en `core/` para que cualquier módulo pueda usarlo sin
 * acoplar `core` a un módulo concreto.
 */
@Injectable()
export class ModuleActiveGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly registry: ModuleRegistryService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleKey = this.reflector.getAllAndOverride<string>(
      REQUIRE_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Sin @RequireModule no hay nada que verificar.
    if (!moduleKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new ForbiddenException('No autenticado');
    }

    const active = await this.registry.isActive(
      user.organizationId,
      moduleKey,
    );
    if (!active) {
      throw new ForbiddenException(
        `El módulo "${moduleKey}" no está activo para tu organización`,
      );
    }
    return true;
  }
}
