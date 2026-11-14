import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { MikroORM, RequestContext } from '@mikro-orm/mysql';
import config from './mikro-orm.config';

async function main() {
  const orm = await MikroORM.init(config);

  // Crea/actualiza las tablas según las entidades, sin borrar tablas ni columnas.
  // Para producción real conviene pasar a migraciones.
  await orm.schema.update({ safe: true });

  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN }));
  app.use(express.json());
  // Un EntityManager (identity map) por request
  app.use((_req, _res, next) => RequestContext.create(orm.em, next));

  // Valida que la API está arriba y que llega a MySQL.
  app.get('/health', async (_req, res) => {
    try {
      await orm.em.getConnection().execute('select 1');
      res.json({ status: 'ok', db: 'up' });
    } catch {
      res.status(503).json({ status: 'error', db: 'down' });
    }
  });

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => console.log(`API de negocio escuchando en :${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
