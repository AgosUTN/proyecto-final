import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('parametros:editar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Parámetros',
    data: {
      breadcrumb: 'Parámetros',
      titulo: 'Parámetros',
      descripcion: 'Canales de venta, medios de pago, política de devolución y tarifas de envío.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
