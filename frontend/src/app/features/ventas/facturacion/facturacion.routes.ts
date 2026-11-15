import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('ventas:leer')],
    title: 'Facturación',
    data: {
      breadcrumb: 'Facturación',
      titulo: 'Facturación',
      descripcion: 'Comprobantes electrónicos emitidos con ARCA y su estado de autorización.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
