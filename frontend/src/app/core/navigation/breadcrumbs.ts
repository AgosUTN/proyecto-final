import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/**
 * Etiqueta de una miga. Puede depender de la ruta (parámetros o datos de un resolver):
 *   breadcrumb: (r) => `Venta ${r.data['venta'].numero}`
 */
export type EtiquetaBreadcrumb = string | ((ruta: ActivatedRouteSnapshot) => string);

/**
 * Valor de `data.breadcrumb` en la definición de una ruta.
 * - string o función: miga navegable.
 * - { label, link: false }: miga que agrupa y no tiene página propia (Vender, Inventario).
 */
export type ConfigBreadcrumb = EtiquetaBreadcrumb | { label: EtiquetaBreadcrumb; link: false };

export interface BreadcrumbItem {
  label: string;
  /** null = no navegable (grupo o página actual). */
  url: string | null;
}

/**
 * Construye la ruta de migas a partir del árbol de rutas activo.
 *
 * Basado en el breadcrumb de App-web, con estos cambios:
 * 1. Lee `routeConfig.data` (lo declarado en la propia ruta) en lugar de `snapshot.data`,
 *    que hereda la data del padre en rutas con path vacío. Ya no hace falta `breadcrumb: ''`.
 * 2. Acumula los segmentos de URL de todos los nodos, tengan miga o no: antes, un padre sin
 *    miga dejaba sus segmentos fuera de la URL de los hijos.
 * 3. Expone un signal (toSignal) en un servicio: sin suscripciones manuales ni ngOnDestroy,
 *    y compatible con la detección de cambios sin zone.js de este proyecto.
 * 4. Etiquetas dinámicas por función (parámetros, datos de resolvers) y migas de grupo no navegables.
 * 5. La regla de navegación es una sola: la última miga y las de grupo no son navegables.
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly router = inject(Router);

  readonly items = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => construirBreadcrumb(this.router.routerState.snapshot.root)),
    ),
    { initialValue: construirBreadcrumb(this.router.routerState.snapshot.root) },
  );
}

export function construirBreadcrumb(raiz: ActivatedRouteSnapshot): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  const segmentos: string[] = [];
  let nodo: ActivatedRouteSnapshot | null = raiz;

  while (nodo) {
    segmentos.push(...nodo.url.map((s) => s.path));
    const config = nodo.routeConfig?.data?.['breadcrumb'] as ConfigBreadcrumb | undefined;

    if (config) {
      const esGrupo = typeof config === 'object';
      const etiqueta = esGrupo ? config.label : config;
      const label = typeof etiqueta === 'function' ? etiqueta(nodo) : etiqueta;
      if (label) items.push({ label, url: esGrupo ? null : '/' + segmentos.join('/') });
    }
    nodo = nodo.firstChild;
  }

  const ultimo = items.at(-1);
  if (ultimo) ultimo.url = null;
  return items;
}
