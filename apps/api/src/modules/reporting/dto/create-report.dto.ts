import { z } from 'zod';

/**
 * Genera un reporte para una conexión y un periodo. Las fechas llegan como
 * strings ISO y se coercionan a Date.
 */
export const createReportSchema = z
  .object({
    connectionId: z.string().min(1, 'connectionId es obligatorio'),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
  })
  .refine((d) => d.periodStart <= d.periodEnd, {
    message: 'periodStart debe ser anterior o igual a periodEnd',
    path: ['periodStart'],
  });

export type CreateReportDto = z.infer<typeof createReportSchema>;
