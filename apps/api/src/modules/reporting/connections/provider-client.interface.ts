/**
 * Contrato común de los clientes de proveedores de datos (Meta Ads, Google Ads,
 * Google Analytics 4). Cada proveedor implementa la obtención de métricas a
 * partir de un access token ya descifrado.
 *
 * Las implementaciones reales requieren credenciales de desarrollador de cada
 * plataforma (ver .env.example). Mientras no existan, los métodos quedan como
 * stubs con TODO — no se inventan datos ni llamadas.
 */
export interface AccountInfo {
  externalId: string;
  displayName: string;
}

export interface ProviderMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  currency: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ProviderClient {
  /** Valida el token y devuelve la cuenta publicitaria/propiedad asociada. */
  verifyAccount(accessToken: string): Promise<AccountInfo>;

  /** Obtiene métricas agregadas del periodo indicado. */
  fetchMetrics(accessToken: string, range: DateRange): Promise<ProviderMetrics>;
}
