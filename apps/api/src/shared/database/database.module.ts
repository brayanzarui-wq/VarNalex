import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo global de base de datos. Al ser @Global, cualquier módulo de `core/`
 * o `modules/` puede inyectar `PrismaService` sin volver a importarlo.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
