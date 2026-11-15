import type { RequestHandler } from 'express';
import type { MikroORM } from '@mikro-orm/mysql';
import { z } from 'zod';
import type { DocRuta } from '../openapi/tipos';

/** Verifica que la API está activa y que llega a MySQL. Responde 503 si la base no está disponible. */
export function salud(orm: MikroORM): RequestHandler {
  return async (_req, res) => {
    try {
      await orm.em.getConnection().execute('select 1');
      res.json({ status: 'ok', db: 'up' });
    } catch {
      res.status(503).json({ status: 'error', db: 'down' });
    }
  };
}

export const saludOpenApi: DocRuta[] = [
  {
    metodo: 'get',
    ruta: '/health',
    resumen: 'Consultar el estado de la API',
    descripcion: 'Responde 503 con `{ status: "error", db: "down" }` si la base de datos no está disponible.',
    publica: true,
    respuesta: {
      status: 200,
      descripcion: 'API y base de datos disponibles.',
      esquema: z.object({ status: z.literal('ok'), db: z.literal('up') }),
    },
  },
];
