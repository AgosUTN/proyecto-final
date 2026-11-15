import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('analisis:leer') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Stock sin rotación',
    data: {
      breadcrumb: 'Stock sin rotación',
      titulo: 'Stock sin rotación',
      descripcion: 'Detección de productos sin rotación y promociones de liquidación.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
