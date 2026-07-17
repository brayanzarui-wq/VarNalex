import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ZodValidationPipe } from '../../shared/validation/zod-validation.pipe';
import { AuditLogService } from '../audit-log/audit-log.service';
import { OrganizationsService } from './organizations.service';

const renameSchema = z.object({
  name: z.string().min(2, 'El nombre es muy corto').max(120),
});
type RenameDto = z.infer<typeof renameSchema>;

@Controller('organizations')
@UseGuards(RolesGuard)
export class OrganizationsController {
  constructor(
    private readonly organizations: OrganizationsService,
    private readonly auditLog: AuditLogService,
  ) {}

  /** Datos de la organización a la que pertenece el usuario autenticado. */
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.organizations.findById(user.organizationId);
  }

  /** Renombra la organización. Solo ADMIN. */
  @Patch('me')
  @Roles(UserRole.ADMIN)
  async rename(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(renameSchema)) body: RenameDto,
  ) {
    const updated = await this.organizations.rename(
      user.organizationId,
      body.name,
    );
    await this.auditLog.record({
      organizationId: user.organizationId,
      userId: user.userId,
      action: 'organization.renamed',
      metadata: { name: updated.name },
    });
    return updated;
  }
}
