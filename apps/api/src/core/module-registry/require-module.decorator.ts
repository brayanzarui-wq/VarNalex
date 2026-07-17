import { SetMetadata } from '@nestjs/common';

export const REQUIRE_MODULE_KEY = 'requireModule';

/**
 * Declara que un controlador o handler pertenece a un módulo de negocio y solo
 * debe responder si la organización tiene ese módulo activo.
 * Se aplica junto con ModuleActiveGuard. Uso: `@RequireModule('reporting')`.
 */
export const RequireModule = (moduleKey: string) =>
  SetMetadata(REQUIRE_MODULE_KEY, moduleKey);
