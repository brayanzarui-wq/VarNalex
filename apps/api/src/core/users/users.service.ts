import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/database/prisma.service';

const BCRYPT_COST = 12; // sección 7 del contexto: costo 12, no negociable.

export interface CreateUserInput {
  email: string;
  password: string;
  organizationId: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_COST);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /** Búsqueda por id acotada por organización (multi-tenancy estricto). */
  async findByIdInOrg(id: string, organizationId: string) {
    return this.prisma.user.findFirst({
      where: { id, organizationId },
    });
  }

  async create(input: CreateUserInput) {
    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const passwordHash = await this.hashPassword(input.password);
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        organizationId: input.organizationId,
        role: input.role ?? UserRole.ADMIN,
      },
    });
  }

  /** Lista los usuarios de una organización (nunca cruza organizaciones). */
  async listForOrganization(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getProfile(userId: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}
