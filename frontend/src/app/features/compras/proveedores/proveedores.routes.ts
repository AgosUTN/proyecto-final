import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('proveedores:gestionar')],
    title: 'Proveedores',
    data: {
      breadcrumb: 'Proveedores',
      titulo: 'Proveedores',
      descripcion: 'Proveedores, compromisos de pago, pagos y cuenta corriente.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
