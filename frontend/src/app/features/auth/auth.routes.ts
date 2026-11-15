import { Routes } from '@angular/router';

/** Inicio de sesión del personal. Se monta en `/login`, fuera del shell (app.routes.ts). */
export default [
  {
    path: '',
    title: 'Iniciar sesión',
    loadComponent: () => import('./pages/login-page'),
  },
] satisfies Routes;
