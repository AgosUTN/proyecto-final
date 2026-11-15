import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('parametros:editar')],
    title: 'Parámetros',
    data: {
      breadcrumb: 'Parámetros',
      titulo: 'Parámetros',
      descripcion: 'Canales de venta, medios de pago, política de devolución y tarifas de envío.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
