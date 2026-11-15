import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('ventas:leer') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
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
