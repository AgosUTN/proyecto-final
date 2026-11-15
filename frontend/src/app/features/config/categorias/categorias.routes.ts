import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

export default [
  {
    path: '',
    canActivate: [permissionGuard('parametros:editar')],
    data: { breadcrumb: 'Categorías' },
    children: [
      {
        path: '',
        title: 'Categorías',
        loadComponent: () => import('./pages/categorias-page'),
      },
      {
        path: 'nueva',
        title: 'Nueva categoría',
        data: { breadcrumb: 'Nueva categoría' },
        loadComponent: () => import('./pages/categoria-form-page'),
      },
      {
        path: ':id',
        title: 'Editar categoría',
        data: { breadcrumb: 'Editar categoría' },
        loadComponent: () => import('./pages/categoria-form-page'),
      },
    ],
  },
] satisfies Routes;
