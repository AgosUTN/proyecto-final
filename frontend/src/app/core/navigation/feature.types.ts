import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';
import { Permiso } from '@core/auth/permisos';

/** Grupos del menú lateral, en el orden en que se muestran. */
export const GRUPOS_NAV = ['Ventas', 'Inventario', 'Compras', 'Análisis', 'Configuración'] as const;
export type GrupoNav = (typeof GRUPOS_NAV)[number];

/**
 * Ítem del menú lateral. Sin ícono: la navegación del sistema de diseño es solo texto
 * (design-system.md, "Navegación").
 */
export interface NavItem {
  ruta: string;
  etiqueta: string;
  /** Sin grupo: ítem suelto al comienzo del menú (Panel). */
  grupo?: GrupoNav;
  permiso: Permiso;
  orden: number;
}

/**
 * Descripción de una feature en un único archivo: rutas y menú (arquitectura-frontend.md, sección 5.4, registro
 * distribuido). Los permisos que exige se declaran en cada `NavItem` y en el `permissionGuard` de sus rutas; qué
 * permisos tiene cada rol no se define en el frontend.
 */
export interface FeatureDef {
  /** Segmento base de URL: 'inventario/stock'. */
  ruta: string;
  /** Carga diferida de las rutas internas (loadChildren). */
  rutas: () => Promise<Routes>;
  nav?: NavItem[];
  /** true en la tienda: usa el shell público. */
  publica?: boolean;
}

/** Lista de features de la aplicación. Se provee en app.config.ts desde app.features.ts. */
export const FEATURES = new InjectionToken<FeatureDef[]>('FEATURES');
