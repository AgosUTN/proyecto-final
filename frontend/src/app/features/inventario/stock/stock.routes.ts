import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('stock:leer') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Stock y variantes',
    data: {
      breadcrumb: 'Stock y variantes',
      titulo: 'Stock y variantes',
      descripcion: 'Stock disponible por variante, movimientos y ajustes manuales.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
