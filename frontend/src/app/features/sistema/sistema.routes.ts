import { Routes } from '@angular/router';

export default [
  {
    path: '',
    title: 'Sistema de diseño',
    data: { breadcrumb: 'Sistema de diseño' },
    loadComponent: () => import('./pages/sistema-page'),
  },
] satisfies Routes;
