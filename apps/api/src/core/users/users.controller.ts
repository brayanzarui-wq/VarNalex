import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ZodValidationPipe } from '../../shared/validation/zod-validation.pipe';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLog: AuditLogService,
  ) {}

  /** Perfil del usuario autenticado. */
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user.userId, user.organizationId);
  }

  /** Lista de usuarios de la organización. Solo ADMIN. */
  @Get()
  @Roles(UserRole.ADMIN)
  async list(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.listForOrganization(user.organizationId);
  }

  /** Alta de un nuevo usuario dentro de la misma organización. Solo ADMIN. */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createUserSchema)) body: CreateUserDto,
  ) {
    const created = await this.usersService.create({
      email: body.email,
      password: body.password,
      role: body.role,
      organizationId: user.organizationId,
    });

    await this.auditLog.record({
      organizationId: user.organizationId,
      userId: user.userId,
      action: 'user.created',
      metadata: { createdUserId: created.id, role: created.role },
    });

    return {
      id: created.id,
      email: created.email,
      role: created.role,
      createdAt: created.createdAt,
    };
  }
}
