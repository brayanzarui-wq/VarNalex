import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodType } from 'zod';

/**
 * Pipe de validación con Zod (sección 7: "DTOs validados, no solo tipados").
 * Se usa por endpoint con `@UsePipes(new ZodValidationPipe(schema))` o como
 * `@Body(new ZodValidationPipe(schema))`.
 *
 * Los valores devueltos son el resultado del parseo de Zod, por lo que también
 * aplica coerción/normalización definida en el schema (trim, defaults, etc.),
 * lo que contribuye a la sanitización de inputs.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Datos de entrada inválidos',
        errors: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    return result.data;
  }
}
