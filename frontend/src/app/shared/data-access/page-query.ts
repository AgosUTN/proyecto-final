import { Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';

/** Página, orden y filtros de un listado del servidor (arquitectura-frontend.md, sección 5.8). */
export interface PageQuery {
  pagina: number;
  tamanio: number;
  orden?: string;
  direccion?: 'asc' | 'desc';
  /** Búsqueda libre. */
  q?: string;
  /** Filtros propios del listado (`padreId`, `estado`). */
  filtros?: Record<string, string>;
}

/** Signal de la consulta ligado a los query params, con la forma de modificarla. */
export interface PageQuerySignal extends Signal<PageQuery> {
  /**
   * Cambia la consulta navegando a los nuevos query params. Un cambio de búsqueda, orden, tamaño o filtros vuelve a
   * la página 1. Los cambios de búsqueda reemplazan la entrada del historial, para no acumular una por tecla.
   */
  actualizar(cambios: Partial<PageQuery>): void;
}

const CLAVES_PROPIAS = new Set(['pagina', 'tamanio', 'orden', 'direccion', 'q']);
const POR_DEFECTO: PageQuery = { pagina: 1, tamanio: 25 };

function entero(valor: string | null, minimo: number, maximo: number): number | undefined {
  const n = Number(valor);
  return valor !== null && Number.isInteger(n) && n >= minimo && n <= maximo ? n : undefined;
}

/** Lee la consulta desde los query params; lo ausente o inválido toma el valor por defecto. */
export function consultaDesdeParams(params: ParamMap, defaults: Partial<PageQuery> = {}): PageQuery {
  const base = { ...POR_DEFECTO, ...defaults };
  const direccion = params.get('direccion');
  const filtros: Record<string, string> = { ...base.filtros };
  for (const clave of params.keys) {
    if (!CLAVES_PROPIAS.has(clave)) filtros[clave] = params.get(clave) ?? '';
  }

  return {
    pagina: entero(params.get('pagina'), 1, Number.MAX_SAFE_INTEGER) ?? base.pagina,
    tamanio: entero(params.get('tamanio'), 1, 100) ?? base.tamanio,
    orden: params.get('orden') ?? base.orden,
    direccion: direccion === 'asc' || direccion === 'desc' ? direccion : base.direccion,
    q: params.get('q') ?? base.q,
    filtros,
  };
}

/** Query params de la URL para una consulta: omite lo vacío y lo que coincide con el valor por defecto. */
function paramsDeUrl(consulta: PageQuery, defaults: Partial<PageQuery>): Params {
  const base = { ...POR_DEFECTO, ...defaults };
  const params: Params = {};
  if (consulta.pagina !== base.pagina) params['pagina'] = consulta.pagina;
  if (consulta.tamanio !== base.tamanio) params['tamanio'] = consulta.tamanio;
  if (consulta.orden && consulta.orden !== base.orden) params['orden'] = consulta.orden;
  if (consulta.direccion && consulta.direccion !== (base.direccion ?? 'asc')) params['direccion'] = consulta.direccion;
  if (consulta.q?.trim()) params['q'] = consulta.q.trim();
  for (const [clave, valor] of Object.entries(consulta.filtros ?? {})) {
    if (valor !== '') params[clave] = valor;
  }
  return params;
}

/** Parámetros que espera la API para un listado (convenciones de la API, sección 3.3). */
export function paramsDeConsulta(consulta: PageQuery): Record<string, string | number> {
  const params: Record<string, string | number> = { pagina: consulta.pagina, tamanio: consulta.tamanio };
  if (consulta.orden) params['orden'] = consulta.orden;
  if (consulta.direccion) params['direccion'] = consulta.direccion;
  if (consulta.q?.trim()) params['q'] = consulta.q.trim();
  for (const [clave, valor] of Object.entries(consulta.filtros ?? {})) {
    if (valor !== '') params[clave] = valor;
  }
  return params;
}

/**
 * Consulta de un listado sincronizada con la URL: recargar la página o compartir el enlace conserva la búsqueda, el
 * orden y la página. Se llama en el contexto de inyección de una page.
 *
 * readonly query = pageQueryDesdeUrl({ tamanio: 25, orden: 'nombre' });
 * readonly lista = httpResource<Paginado<Fila>>(() => this.api.listarUrl(this.query()));
 */
export function pageQueryDesdeUrl(defaults: Partial<PageQuery> = {}): PageQuerySignal {
  const ruta = inject(ActivatedRoute);
  const router = inject(Router);
  const params = toSignal(ruta.queryParamMap, { initialValue: ruta.snapshot.queryParamMap });
  const consulta = computed(() => consultaDesdeParams(params(), defaults));

  const actualizar = (cambios: Partial<PageQuery>) => {
    const vuelveAlInicio = ['q', 'orden', 'direccion', 'tamanio', 'filtros'].some((c) => c in cambios);
    const nueva = { ...consulta(), ...(vuelveAlInicio ? { pagina: 1 } : {}), ...cambios };
    void router.navigate([], {
      relativeTo: ruta,
      queryParams: paramsDeUrl(nueva, defaults),
      replaceUrl: 'q' in cambios,
    });
  };

  return Object.assign(consulta, { actualizar });
}
