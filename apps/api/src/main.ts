import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  // Cabeceras de seguridad (sección 7).
  app.use(helmet());

  // Parseo de cookies httpOnly (tokens de sesión).
  app.use(cookieParser());

  // Redirección HTTP -> HTTPS obligatoria en producción (sección 7).
  if (isProduction) {
    app.set('trust proxy', 1);
    app.use((req: Request, res: Response, next: NextFunction) => {
      const forwardedProto = req.headers['x-forwarded-proto'];
      if (forwardedProto && forwardedProto !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  // CORS con credenciales para permitir el envío de cookies desde el frontend.
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3001'),
    credentials: true,
  });

  // Prefijo común de la API.
  app.setGlobalPrefix('api');

  // La validación de entrada se hace con Zod por endpoint (ZodValidationPipe),
  // por lo que no se registra el ValidationPipe de NestJS (que requiere
  // class-validator). Ver sección 7 del contexto.

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}

void bootstrap();
