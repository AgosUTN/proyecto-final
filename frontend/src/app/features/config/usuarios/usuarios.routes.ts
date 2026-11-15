import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('usuarios:administrar')],
    title: 'Usuarios y roles',
    data: {
      breadcrumb: 'Usuarios y roles',
      titulo: 'Usuarios y roles',
      descripcion: 'Usuarios del sistema y rol asignado a cada uno.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
