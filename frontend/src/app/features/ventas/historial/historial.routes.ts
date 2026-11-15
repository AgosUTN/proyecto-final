import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('ventas:leer')],
    title: 'Historial de ventas',
    data: {
      breadcrumb: 'Historial de ventas',
      titulo: 'Historial de ventas',
      descripcion:
        'Consulta de ventas del local, la tienda online y Mercado Libre, con su detalle, comprobante y cuotas.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
