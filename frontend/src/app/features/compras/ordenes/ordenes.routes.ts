import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('compras:gestionar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Órdenes de compra',
    data: {
      breadcrumb: 'Órdenes de compra',
      titulo: 'Órdenes de compra',
      descripcion: 'Sugerencias de reposición, emisión y seguimiento de órdenes de compra.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
