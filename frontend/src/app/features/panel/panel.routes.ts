import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('panel:leer')],
    title: 'Panel del día',
    data: {
      breadcrumb: 'Panel del día',
      titulo: 'Panel del día',
      descripcion: 'Resumen diario de ventas, pedidos pendientes y temas que requieren atención.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
