import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('panel:leer') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Panel del día',
    data: {
      breadcrumb: 'Panel del día',
      titulo: 'Panel del día',
      descripcion: 'Resumen diario de ventas, pedidos pendientes y temas que requieren atención.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
