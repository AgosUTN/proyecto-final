import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/mysql';
import { ENTIDADES } from '../../src/modules';
import { configuracionOrm } from '../../src/shared/db/mikro-orm.config';

/** Regenera el esquema de la base de prueba una vez, antes de todos los tests. */
export async function setup() {
  const orm = await MikroORM.init(configuracionOrm(ENTIDADES));
  await orm.schema.refresh();
  await orm.close();
}
