import type { EntityClass, FilterQuery, FindOneOrFailOptions, Loaded } from '@mikro-orm/core';
import { em } from '../db/orm';

/**
 * Busca un registro por id. Si no existe, MikroORM lanza `NotFoundError` y el manejador central responde 404
 * `NO_ENCONTRADO`.
 */
export function buscarOFallar<T extends object, P extends string = never>(
  entidad: EntityClass<T>,
  id: number,
  opciones?: FindOneOrFailOptions<T, P>,
): Promise<Loaded<T, P>> {
  return em().findOneOrFail(entidad, { id } as FilterQuery<T>, opciones);
}
