import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  AccountInfo,
  DateRange,
  ProviderClient,
  ProviderMetrics,
} from './provider-client.interface';

/**
 * Cliente de Google Analytics 4 — Data API.
 *
 * STUB: la integración real usa GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET y la
 * Analytics Data API. En el diseño (sección 8) GA4 aparece como "pendiente de
 * conectar". Se implementará cuando existan credenciales. No se inventan datos.
 */
@Injectable()
export class GoogleAnalyticsService implements ProviderClient {
  readonly provider = 'GOOGLE_ANALYTICS' as const;

  verifyAccount(_accessToken: string): Promise<AccountInfo> {
    // TODO(ga4): Admin API accountSummaries.list para validar el token.
    throw new NotImplementedException(
      'Integración con Google Analytics 4 pendiente de credenciales',
    );
  }

  fetchMetrics(
    _accessToken: string,
    _range: DateRange,
  ): Promise<ProviderMetrics> {
    // TODO(ga4): properties.runReport con dimensiones/métricas del periodo.
    throw new NotImplementedException(
      'Obtención de métricas de Google Analytics 4 pendiente de credenciales',
    );
  }
}
