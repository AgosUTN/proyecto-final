import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('compras:gestionar')],
    title: 'Órdenes de compra',
    data: {
      breadcrumb: 'Órdenes de compra',
      titulo: 'Órdenes de compra',
      descripcion: 'Sugerencias de reposición, emisión y seguimiento de órdenes de compra.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
