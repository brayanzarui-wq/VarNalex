import type { ConnectionProvider, ReportStatus } from './types';

export const PROVIDER_LABELS: Record<ConnectionProvider, string> = {
  META_ADS: 'Meta Ads',
  GOOGLE_ADS: 'Google Ads',
  GOOGLE_ANALYTICS: 'Google Analytics 4',
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pendiente',
  GENERATED: 'Generado',
  SENT: 'Enviado',
  FAILED: 'Error',
};

export const STATUS_BADGE: Record<
  ReportStatus,
  'default' | 'success' | 'warning' | 'danger' | 'accent'
> = {
  PENDING: 'warning',
  GENERATED: 'accent',
  SENT: 'success',
  FAILED: 'danger',
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function monthLabel(iso: string): string {
  return MONTHS[new Date(iso).getMonth()];
}
