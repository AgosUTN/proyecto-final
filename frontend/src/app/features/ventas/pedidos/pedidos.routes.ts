import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('pedidos:gestionar')],
    title: 'Pedidos',
    data: {
      breadcrumb: 'Pedidos',
      titulo: 'Pedidos',
      descripcion: 'Preparación, despacho con Andreani y seguimiento de la entrega de pedidos.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
