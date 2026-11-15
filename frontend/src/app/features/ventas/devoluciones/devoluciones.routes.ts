import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('devoluciones:registrar')],
    title: 'Devoluciones',
    data: {
      breadcrumb: 'Devoluciones',
      titulo: 'Devoluciones',
      descripcion: 'Solicitudes de devolución, evaluación, verificación y nota de crédito.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
