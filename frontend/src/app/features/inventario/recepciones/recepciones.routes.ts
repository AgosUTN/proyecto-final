import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('recepciones:registrar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Recepciones',
    data: {
      breadcrumb: 'Recepciones',
      titulo: 'Recepciones',
      descripcion: 'Recepción de mercadería con control contra la orden de compra.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
