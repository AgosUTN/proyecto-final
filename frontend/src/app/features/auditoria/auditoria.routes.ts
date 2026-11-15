import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('auditoria:leer')],
    title: 'Auditoría',
    data: {
      breadcrumb: 'Auditoría',
      titulo: 'Auditoría',
      descripcion: 'Registro de los cambios realizados en el sistema.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
