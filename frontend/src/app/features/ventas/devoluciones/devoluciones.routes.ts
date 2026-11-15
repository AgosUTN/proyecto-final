import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('devoluciones:registrar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Devoluciones',
    data: {
      breadcrumb: 'Devoluciones',
      titulo: 'Devoluciones',
      descripcion: 'Solicitudes de devolución, evaluación, verificación y nota de crédito.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
