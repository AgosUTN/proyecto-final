import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('ventas:registrar')],
    title: 'Venta en mostrador',
    data: {
      breadcrumb: 'Venta en mostrador',
      titulo: 'Venta en mostrador',
      descripcion:
        'Registro de ventas presenciales, con búsqueda de productos, cobro con Mercado Pago y emisión del comprobante electrónico.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
