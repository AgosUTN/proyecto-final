import { randomUUID } from 'node:crypto';
import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { RequestContext, type MikroORM } from '@mikro-orm/mysql';
import { env } from './config/env';
import { MODULOS } from './modules';
import { autenticar } from './shared/auth/autenticar';
import { errorHandler, rutaInexistente } from './shared/http/error-handler';
import { salud, saludOpenApi } from './shared/http/salud';
import { logger } from './shared/logger';
import { crearDocumento } from './shared/openapi/documento';
import { publicarDocumentacion } from './shared/openapi/publicar';
import type { GrupoDocumentado } from './shared/openapi/tipos';

/** Rutas documentadas: las propias de la app y las de cada módulo. */
export function gruposDocumentados(): GrupoDocumentado[] {
  return [
    { prefijo: '', etiqueta: 'sistema', rutas: saludOpenApi },
    ...MODULOS.map((modulo) => ({
      prefijo: `/api${modulo.ruta}`,
      etiqueta: modulo.ruta.slice(1),
      rutas: modulo.openapi,
    })),
  ];
}

/** Crea la app de Express. Separada de `index.ts` para testearla con Supertest. */
export function crearApp(orm: MikroORM): Express {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      genReqId: (_req, res) => {
        const id = randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) return 'error';
        return res.statusCode >= 400 ? 'warn' : 'info';
      },
    }),
  );
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  // Un EntityManager (identity map) por request
  app.use((_req, _res, next) => RequestContext.create(orm.em, next));

  app.get('/health', salud(orm));
  publicarDocumentacion(app, crearDocumento(gruposDocumentados()));
  // La autenticación se aplica una sola vez a cada módulo no público; los permisos, en cada ruta.
  for (const modulo of MODULOS) {
    app.use(`/api${modulo.ruta}`, ...(modulo.publico ? [] : [autenticar]), modulo.router);
  }

  app.use(rutaInexistente);
  app.use(errorHandler);
  return app;
}
