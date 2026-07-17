import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { sanitizeText } from '../../shared/utils/sanitize';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.organization.create({
      data: { name: sanitizeText(name) },
    });
  }

  async findById(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organización no encontrada');
    }
    return org;
  }

  async rename(id: string, name: string) {
    await this.findById(id);
    return this.prisma.organization.update({
      where: { id },
      data: { name: sanitizeText(name) },
    });
  }
}
