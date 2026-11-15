import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('mayoristas:administrar')],
    title: 'Clientes mayoristas',
    data: {
      breadcrumb: 'Clientes mayoristas',
      titulo: 'Clientes mayoristas',
      descripcion: 'Clientes mayoristas, cuenta corriente, ventas y cobro de cuotas.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
