import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('productos:leer') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Productos',
    data: {
      breadcrumb: 'Productos',
      titulo: 'Productos',
      descripcion:
        'Catálogo de productos y variantes, con precios, costos, fotos y publicación en la tienda online y Mercado Libre.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
