import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('parametros:editar')],
    title: 'Categorías',
    data: {
      breadcrumb: 'Categorías',
      titulo: 'Categorías',
      descripcion: 'Árbol de categorías del catálogo.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
