import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('analisis:leer')],
    title: 'Reportes',
    data: {
      breadcrumb: 'Reportes',
      titulo: 'Reportes',
      descripcion: 'Reportes de ventas, compras, stock y clientes.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
