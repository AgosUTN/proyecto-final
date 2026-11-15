import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('proveedores:gestionar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Proveedores',
    data: {
      breadcrumb: 'Proveedores',
      titulo: 'Proveedores',
      descripcion: 'Proveedores, compromisos de pago, pagos y cuenta corriente.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
