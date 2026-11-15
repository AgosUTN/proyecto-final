import { HttpClient, HttpResourceRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Baja, Paginado, Respuesta } from './api.types';
import { PageQuery, paramsDeConsulta } from './page-query';

/** Operaciones CRUD de un recurso de la API (convenciones de la API, sección 3.2). */
export interface CrudApi<Alta, Detalle, Edicion, Fila> {
  /** Solicitud del listado, para `httpResource<Paginado<Fila>>`. */
  listarUrl(consulta: PageQuery): HttpResourceRequest;
  /** Listado como Observable, para búsquedas puntuales (por ejemplo, un autocompletar). */
  listar(consulta: PageQuery): Observable<Paginado<Fila>>;
  /** Solicitud del detalle, para `httpResource<Respuesta<Detalle>>`. */
  obtenerUrl(id: number): string;
  obtener(id: number): Observable<Detalle>;
  crear(dto: Alta): Observable<Detalle>;
  actualizar(id: number, dto: Edicion): Observable<Detalle>;
  eliminar(id: number): Observable<Baja>;
}

/**
 * Servicio CRUD genérico por composición (arquitectura-frontend.md, sección 5.8). Recibe la URL lógica del recurso
 * (`'categorias'`; el interceptor `apiBase` antepone `/api`) y desenvuelve `{ datos }`. Se llama en el contexto de
 * inyección del `.api.ts` de la feature:
 *
 * private readonly crud = crudApi<CategoriaAltaDto, CategoriaDetalleDto, CategoriaEdicionDto, CategoriaFilaDto>('categorias');
 */
export function crudApi<Alta, Detalle, Edicion, Fila>(
  recurso: string,
): CrudApi<Alta, Detalle, Edicion, Fila> {
  const http = inject(HttpClient);
  const datos = <T>(respuesta: Observable<Respuesta<T>>) => respuesta.pipe(map((r) => r.datos));

  return {
    listarUrl: (consulta) => ({ url: recurso, params: paramsDeConsulta(consulta) }),
    listar: (consulta) => http.get<Paginado<Fila>>(recurso, { params: paramsDeConsulta(consulta) }),
    obtenerUrl: (id) => `${recurso}/${id}`,
    obtener: (id) => datos(http.get<Respuesta<Detalle>>(`${recurso}/${id}`)),
    crear: (dto) => datos(http.post<Respuesta<Detalle>>(recurso, dto)),
    actualizar: (id, dto) => datos(http.put<Respuesta<Detalle>>(`${recurso}/${id}`, dto)),
    eliminar: (id) => datos(http.delete<Respuesta<Baja>>(`${recurso}/${id}`)),
  };
}
