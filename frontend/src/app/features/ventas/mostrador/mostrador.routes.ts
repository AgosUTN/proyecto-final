import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('ventas:registrar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
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
