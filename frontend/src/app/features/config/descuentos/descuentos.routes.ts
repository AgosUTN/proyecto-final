import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('descuentos:editar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Descuentos',
    data: {
      breadcrumb: 'Descuentos',
      titulo: 'Descuentos',
      descripcion: 'Promociones y descuentos, con su vigencia y alcance.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
