import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/mysql';
import { crearApp } from './app';
import { env } from './config/env';
import { ENTIDADES } from './modules';
import { configuracionOrm } from './shared/db/mikro-orm.config';
import { logger } from './shared/logger';

async function main() {
  const orm = await MikroORM.init(configuracionOrm(ENTIDADES));

  // Crea o actualiza las tablas según las entidades, sin borrar tablas ni columnas (convenciones, sección 7.5).
  await orm.schema.update({ safe: true });

  crearApp(orm).listen(env.PORT, () => {
    logger.info(`API de negocio escuchando en el puerto ${env.PORT}`);
  });
}

main().catch((error: unknown) => {
  logger.fatal({ err: error }, 'No se pudo iniciar la API de negocio');
  process.exit(1);
});
