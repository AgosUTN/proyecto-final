import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('mayoristas:administrar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Clientes mayoristas',
    data: {
      breadcrumb: 'Clientes mayoristas',
      titulo: 'Clientes mayoristas',
      descripcion: 'Clientes mayoristas, cuenta corriente, ventas y cobro de cuotas.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
