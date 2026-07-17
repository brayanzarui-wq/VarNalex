import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../../core/auth/auth.types';
import { CurrentUser } from '../../../core/auth/decorators/current-user.decorator';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { ModuleActiveGuard } from '../../../core/module-registry/module-active.guard';
import { RequireModule } from '../../../core/module-registry/require-module.decorator';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe';
import { AuditLogService } from '../../../core/audit-log/audit-log.service';
import {
  CreateConnectionDto,
  createConnectionSchema,
} from '../dto/create-connection.dto';
import { REPORTING_MODULE_KEY } from '../reporting.constants';
import { ConnectionsService } from './connections.service';

/**
 * Rutas de conexiones del módulo de reportes. `@RequireModule` + ModuleActiveGuard
 * garantizan que solo respondan si la organización tiene el módulo activo.
 */
@Controller('reporting/connections')
@RequireModule(REPORTING_MODULE_KEY)
@UseGuards(ModuleActiveGuard, RolesGuard)
export class ConnectionsController {
  constructor(
    private readonly connections: ConnectionsService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.connections.list(user.organizationId);
  }

  /** Conecta una fuente de datos. ADMIN u OPERATOR. */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  async connect(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createConnectionSchema))
    body: CreateConnectionDto,
  ) {
    const conn = await this.connections.create(user.organizationId, body);
    await this.auditLog.record({
      organizationId: user.organizationId,
      userId: user.userId,
      action: 'reporting.connection.created',
      metadata: { provider: conn.provider, connectionId: conn.id },
    });
    return conn;
  }

  /** Desconecta una fuente de datos. ADMIN u OPERATOR. */
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  async disconnect(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const conn = await this.connections.disconnect(user.organizationId, id);
    await this.auditLog.record({
      organizationId: user.organizationId,
      userId: user.userId,
      action: 'reporting.connection.disconnected',
      metadata: { provider: conn.provider, connectionId: conn.id },
    });
    return conn;
  }
}
