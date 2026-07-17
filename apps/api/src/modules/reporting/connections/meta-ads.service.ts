import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  AccountInfo,
  DateRange,
  ProviderClient,
  ProviderMetrics,
} from './provider-client.interface';

/**
 * Cliente de Meta Ads (Facebook/Instagram) — Marketing API.
 *
 * STUB: la integración real usa META_APP_ID / META_APP_SECRET y el Graph API.
 * Se implementará cuando existan credenciales de desarrollador (sección 9,
 * punto 5). No se inventan llamadas ni datos.
 */
@Injectable()
export class MetaAdsService implements ProviderClient {
  readonly provider = 'META_ADS' as const;

  verifyAccount(_accessToken: string): Promise<AccountInfo> {
    // TODO(meta): GET /me/adaccounts contra el Graph API para validar el token.
    throw new NotImplementedException(
      'Integración con Meta Ads pendiente de credenciales de desarrollador',
    );
  }

  fetchMetrics(
    _accessToken: string,
    _range: DateRange,
  ): Promise<ProviderMetrics> {
    // TODO(meta): GET /{ad-account-id}/insights con el rango de fechas.
    throw new NotImplementedException(
      'Obtención de métricas de Meta Ads pendiente de credenciales',
    );
  }
}
