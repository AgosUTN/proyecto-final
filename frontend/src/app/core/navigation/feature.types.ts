import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';
import { Permiso, RolEmpleado } from '@core/auth/roles';

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
 * Descripción de una feature en un único archivo: rutas, menú y permisos
 * (arquitectura-frontend.md, sección 5.4, registro distribuido).
 */
export interface FeatureDef {
  /** Segmento base de URL: 'inventario/stock'. */
  ruta: string;
  /** Carga diferida de las rutas internas (loadChildren). */
  rutas: () => Promise<Routes>;
  nav?: NavItem[];
  /** Roles que reciben cada permiso de la feature. */
  permisos: Partial<Record<Permiso, RolEmpleado[]>>;
  /** true en la tienda: usa el shell público. */
  publica?: boolean;
}

/** Lista de features de la aplicación. Se provee en app.config.ts desde app.features.ts. */
export const FEATURES = new InjectionToken<FeatureDef[]>('FEATURES');
