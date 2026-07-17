import { Injectable, Logger } from '@nestjs/common';

/**
 * Servicio de facturación del núcleo.
 *
 * MVP: estructura mínima. La integración real con una pasarela de pago
 * (Stripe / Conekta) se hará después — no es prioridad para el MVP funcional
 * (sección 9, punto 4). Por ahora expone un plan por defecto para que el resto
 * del sistema pueda consultarlo sin depender de la pasarela.
 */
export type BillingPlan = 'free' | 'pro' | 'agency';

export interface BillingStatus {
  organizationId: string;
  plan: BillingPlan;
  active: boolean;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  /** Estado de facturación de la organización. */
  getStatus(organizationId: string): BillingStatus {
    // TODO(billing): consultar suscripción real en la pasarela de pago.
    return { organizationId, plan: 'free', active: true };
  }

  /** Punto de entrada para futuros webhooks de la pasarela de pago. */
  handleWebhook(_payload: unknown): void {
    // TODO(billing): validar firma y procesar eventos de suscripción.
    this.logger.debug('Webhook de billing recibido (no implementado en MVP)');
  }
}
