import { Route, Routes } from '@angular/router';
import { authGuard, invitadoGuard } from '@core/auth/auth.guard';
import { FeatureDef } from '@core/navigation/feature.types';
import { ConfigBreadcrumb } from '@core/navigation/breadcrumbs';
import { Shell } from '@layout/shell';
import { FEATURES_APP } from './app.features';

/** Ruta de una feature. Su grupo del menú aparece como miga no navegable ("Inventario / Stock y variantes"). */
function rutaDeFeature(f: FeatureDef): Route {
  const grupo = f.nav?.[0]?.grupo;
  return {
    path: f.ruta,
    data: grupo ? { breadcrumb: { label: grupo, link: false } satisfies ConfigBreadcrumb } : {},
    loadChildren: f.rutas,
  };
}

/** Las rutas más específicas primero: 'ventas/mostrador' antes que 'ventas'. */
const porEspecificidad = (a: FeatureDef, b: FeatureDef) =>
  b.ruta.split('/').length - a.ruta.split('/').length;

const internas = FEATURES_APP.filter((f) => !f.publica).sort(porEspecificidad);

// Pendiente según arquitectura-frontend.md: shell público de la tienda (5.4).
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadChildren: () => import('@features/auth/auth.routes'),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'panel' },
      ...internas.map(rutaDeFeature),
      {
        path: 'sin-permiso',
        title: 'Acceso restringido',
        data: { breadcrumb: 'Acceso restringido' },
        loadComponent: () => import('@layout/errores/sin-permiso-page'),
      },
      {
        path: '**',
        title: 'Página no encontrada',
        data: { breadcrumb: 'Página no encontrada' },
        loadComponent: () => import('@layout/errores/no-encontrado-page'),
      },
    ],
  },
];
