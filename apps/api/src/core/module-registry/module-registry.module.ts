import { Global, Module } from '@nestjs/common';
import { ModuleActiveGuard } from './module-active.guard';
import { ModuleRegistryService } from './module-registry.service';

/**
 * Global para que los módulos de negocio puedan usar ModuleActiveGuard y
 * consultar el registro sin reimportarlo.
 */
@Global()
@Module({
  providers: [ModuleRegistryService, ModuleActiveGuard],
  exports: [ModuleRegistryService, ModuleActiveGuard],
})
export class ModuleRegistryModule {}
