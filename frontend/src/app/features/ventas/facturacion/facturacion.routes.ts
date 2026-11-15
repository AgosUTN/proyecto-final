import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('ventas:leer') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Facturación',
    data: {
      breadcrumb: 'Facturación',
      titulo: 'Facturación',
      descripcion: 'Comprobantes electrónicos emitidos con ARCA y su estado de autorización.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
