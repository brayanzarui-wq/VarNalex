import {
  Body,
  Controller,
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
import { CreateReportDto, createReportSchema } from '../dto/create-report.dto';
import { REPORTING_MODULE_KEY } from '../reporting.constants';
import { ReportsService } from './reports.service';

@Controller('reporting/reports')
@RequireModule(REPORTING_MODULE_KEY)
@UseGuards(ModuleActiveGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.reports.list(user.organizationId);
  }

  @Get(':id')
  getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.reports.getById(user.organizationId, id);
  }

  /** Crea un reporte. ADMIN u OPERATOR. */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createReportSchema)) body: CreateReportDto,
  ) {
    const report = await this.reports.create(user.organizationId, body);
    await this.auditLog.record({
      organizationId: user.organizationId,
      userId: user.userId,
      action: 'reporting.report.created',
      metadata: { reportId: report.id, connectionId: report.connectionId },
    });
    return report;
  }

  /** Dispara la generación del reporte. ADMIN u OPERATOR. */
  @Post(':id/generate')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  generate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.reports.generate(user.organizationId, id);
  }

  /** Reenvía el reporte al cliente. ADMIN u OPERATOR. */
  @Post(':id/resend')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  resend(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.reports.resend(user.organizationId, id);
  }
}
