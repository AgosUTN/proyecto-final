import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('ventas:registrar') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Venta por redes sociales',
    data: {
      breadcrumb: 'Venta por redes sociales',
      titulo: 'Venta por redes sociales',
      descripcion: 'Registro manual de ventas acordadas por redes sociales, con opción de envío.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
