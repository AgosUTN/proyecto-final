import { FeatureDef, GRUPOS_NAV, GrupoNav, NavItem } from './feature.types';

export interface GrupoMenu {
  /** null: ítems sueltos al comienzo del menú. */
  grupo: GrupoNav | null;
  items: NavItem[];
}

/**
 * Reúne los ítems de menú de todas las features, agrupados y ordenados
 * (arquitectura-frontend.md, sección 5.5). No existe una lista central de ítems.
 *
 * Pendiente: cuando exista AuthStore, filtrar los ítems por `permiso`.
 */
export function construirMenu(features: FeatureDef[]): GrupoMenu[] {
  const items = features.flatMap((f) => f.nav ?? []);
  const porOrden = (a: NavItem, b: NavItem) => a.orden - b.orden;

  const sueltos: GrupoMenu = { grupo: null, items: items.filter((i) => !i.grupo).sort(porOrden) };
  const agrupados = GRUPOS_NAV.map((grupo) => ({
    grupo,
    items: items.filter((i) => i.grupo === grupo).sort(porOrden),
  }));

  return [sueltos, ...agrupados].filter((g) => g.items.length > 0);
}
