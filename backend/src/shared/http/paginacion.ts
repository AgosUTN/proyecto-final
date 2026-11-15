import type { EntityManager, EntityName, FilterQuery, FindOptions, QueryOrderMap } from '@mikro-orm/mysql';
import { z, type ZodRawShape } from 'zod';

/**
 * Filtro de baja lógica para los listados de maestros (convenciones, secciones 3.3 y 7.2). Se suma a los `filtros` de
 * `esquemaPagina`; con él, `paginar` oculta los registros inactivos salvo con `incluirInactivos=true`.
 */
export const filtroInactivos = {
  incluirInactivos: z.stringbool().default(false),
};

/**
 * Esquema Zod de los parámetros de un listado: página, tamaño, orden (solo columnas de la lista blanca), dirección,
 * búsqueda libre y los filtros propios del módulo.
 */
export function esquemaPagina<const O extends readonly [string, ...string[]], F extends ZodRawShape = {}>(opciones: {
  ordenables: O;
  filtros?: F;
}) {
  return z.object({
    pagina: z.coerce.number().int().min(1).default(1),
    tamanio: z.coerce.number().int().min(1).max(100).default(25),
    orden: z.enum(opciones.ordenables).default(opciones.ordenables[0] as O[number]),
    direccion: z.enum(['asc', 'desc']).default('asc'),
    q: z.string().trim().max(100).optional(),
    ...(opciones.filtros ?? ({} as F)),
  });
}

/** Parámetros comunes que `paginar` interpreta. Los filtros propios los traduce el servicio a `where`. */
export interface ConsultaPagina {
  pagina: number;
  tamanio: number;
  orden: string;
  direccion: 'asc' | 'desc';
  q?: string;
  incluirInactivos?: boolean;
}

export interface Pagina<T> {
  datos: T[];
  total: number;
  pagina: number;
  tamanio: number;
}

export interface OpcionesPaginar<T extends object, P extends string> {
  /** Columnas donde se busca el texto de `q`. */
  buscarEn?: string[];
  /** Condiciones propias del módulo (por ejemplo, sus filtros). */
  where?: FilterQuery<T>;
  populate?: FindOptions<T, P>['populate'];
}

/** Escapa los comodines de LIKE para que `q` se busque como texto literal. */
function escaparLike(texto: string): string {
  return texto.replace(/[\\%_]/g, (caracter) => `\\${caracter}`);
}

/** Ejecuta un listado paginado y devuelve `{ datos, total, pagina, tamanio }`. */
export async function paginar<T extends object, P extends string = never>(
  em: EntityManager,
  entidad: EntityName<T>,
  query: ConsultaPagina,
  opciones: OpcionesPaginar<T, P> = {},
): Promise<Pagina<T>> {
  const condiciones: Record<string, unknown>[] = [];
  if (opciones.where) condiciones.push(opciones.where as Record<string, unknown>);
  if (query.incluirInactivos === false) condiciones.push({ activo: true });
  if (query.q && opciones.buscarEn?.length) {
    const patron = `%${escaparLike(query.q)}%`;
    condiciones.push({ $or: opciones.buscarEn.map((columna) => ({ [columna]: { $like: patron } })) });
  }

  const orden: Record<string, 'asc' | 'desc'>[] = [{ [query.orden]: query.direccion }];
  if (query.orden !== 'id') orden.push({ id: 'asc' });

  const [datos, total] = await em.findAndCount(entidad, { $and: condiciones } as FilterQuery<T>, {
    populate: opciones.populate,
    orderBy: orden as QueryOrderMap<T>[],
    limit: query.tamanio,
    offset: (query.pagina - 1) * query.tamanio,
  } as FindOptions<T, P>);

  return { datos: datos as T[], total, pagina: query.pagina, tamanio: query.tamanio };
}
