import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restringe un endpoint a uno o más roles. Se aplica junto con RolesGuard.
 * Uso: `@Roles(UserRole.ADMIN)`.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
