import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('pedidos:gestionar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Pedidos',
    data: {
      breadcrumb: 'Pedidos',
      titulo: 'Pedidos',
      descripcion: 'Preparación, despacho con Andreani y seguimiento de la entrega de pedidos.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
