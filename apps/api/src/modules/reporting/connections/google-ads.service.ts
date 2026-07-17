import { Injectable, NotImplementedException } from '@nestjs/common';
import {
  AccountInfo,
  DateRange,
  ProviderClient,
  ProviderMetrics,
} from './provider-client.interface';

/**
 * Cliente de Google Ads — Google Ads API.
 *
 * STUB: la integración real usa GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET y
 * GOOGLE_ADS_DEVELOPER_TOKEN. Se implementará cuando existan credenciales
 * (sección 9, punto 5). No se inventan llamadas ni datos.
 */
@Injectable()
export class GoogleAdsService implements ProviderClient {
  readonly provider = 'GOOGLE_ADS' as const;

  verifyAccount(_accessToken: string): Promise<AccountInfo> {
    // TODO(google-ads): CustomerService.listAccessibleCustomers.
    throw new NotImplementedException(
      'Integración con Google Ads pendiente de credenciales de desarrollador',
    );
  }

  fetchMetrics(
    _accessToken: string,
    _range: DateRange,
  ): Promise<ProviderMetrics> {
    // TODO(google-ads): GoogleAdsService.search con una consulta GAQL.
    throw new NotImplementedException(
      'Obtención de métricas de Google Ads pendiente de credenciales',
    );
  }
}
