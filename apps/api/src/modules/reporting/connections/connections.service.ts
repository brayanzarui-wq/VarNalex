import { Injectable, NotFoundException } from '@nestjs/common';
import { Connection, ConnectionProvider } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CryptoService } from '../../../shared/crypto/crypto.service';
import { CreateConnectionDto } from '../dto/create-connection.dto';
import { GoogleAdsService } from './google-ads.service';
import { GoogleAnalyticsService } from './google-analytics.service';
import { MetaAdsService } from './meta-ads.service';
import { ProviderClient } from './provider-client.interface';

/** Vista pública de una conexión: nunca expone los tokens (ni cifrados). */
export interface ConnectionView {
  id: string;
  provider: ConnectionProvider;
  externalId: string | null;
  isActive: boolean;
  connectedAt: Date;
}

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly metaAds: MetaAdsService,
    private readonly googleAds: GoogleAdsService,
    private readonly googleAnalytics: GoogleAnalyticsService,
  ) {}

  /** Resuelve el cliente de proveedor correspondiente. */
  resolveClient(provider: ConnectionProvider): ProviderClient {
    switch (provider) {
      case ConnectionProvider.META_ADS:
        return this.metaAds;
      case ConnectionProvider.GOOGLE_ADS:
        return this.googleAds;
      case ConnectionProvider.GOOGLE_ANALYTICS:
        return this.googleAnalytics;
    }
  }

  /**
   * Crea (o reconecta) una conexión. Los tokens se CIFRAN antes de escribir a
   * BD (sección 6). Multi-tenancy: siempre ligada a la organización.
   */
  async create(
    organizationId: string,
    dto: CreateConnectionDto,
  ): Promise<ConnectionView> {
    const created = await this.prisma.connection.create({
      data: {
        organizationId,
        provider: dto.provider,
        accessToken: this.crypto.encrypt(dto.accessToken),
        refreshToken: dto.refreshToken
          ? this.crypto.encrypt(dto.refreshToken)
          : null,
        externalId: dto.externalId ?? null,
        isActive: true,
      },
    });
    return this.toView(created);
  }

  /** Lista las conexiones de la organización (sin tokens). */
  async list(organizationId: string): Promise<ConnectionView[]> {
    const rows = await this.prisma.connection.findMany({
      where: { organizationId },
      orderBy: { connectedAt: 'desc' },
    });
    return rows.map((r) => this.toView(r));
  }

  /** Desactiva (desconecta) una conexión de la organización. */
  async disconnect(
    organizationId: string,
    connectionId: string,
  ): Promise<ConnectionView> {
    const existing = await this.prisma.connection.findFirst({
      where: { id: connectionId, organizationId },
    });
    if (!existing) {
      throw new NotFoundException('Conexión no encontrada');
    }
    const updated = await this.prisma.connection.update({
      where: { id: existing.id },
      data: { isActive: false },
    });
    return this.toView(updated);
  }

  /**
   * Obtiene los tokens descifrados de una conexión. Uso interno del módulo
   * (p. ej. reports al generar). Acotado por organización.
   */
  async getDecryptedTokens(
    organizationId: string,
    connectionId: string,
  ): Promise<{ accessToken: string; refreshToken: string | null }> {
    const conn = await this.prisma.connection.findFirst({
      where: { id: connectionId, organizationId },
    });
    if (!conn) {
      throw new NotFoundException('Conexión no encontrada');
    }
    return {
      accessToken: this.crypto.decrypt(conn.accessToken),
      refreshToken: conn.refreshToken
        ? this.crypto.decrypt(conn.refreshToken)
        : null,
    };
  }

  private toView(c: Connection): ConnectionView {
    return {
      id: c.id,
      provider: c.provider,
      externalId: c.externalId,
      isActive: c.isActive,
      connectedAt: c.connectedAt,
    };
  }
}
