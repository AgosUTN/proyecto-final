import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('ventas:registrar')],
    title: 'Venta por redes sociales',
    data: {
      breadcrumb: 'Venta por redes sociales',
      titulo: 'Venta por redes sociales',
      descripcion: 'Registro manual de ventas acordadas por redes sociales, con opción de envío.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
