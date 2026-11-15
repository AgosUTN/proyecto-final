import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('analisis:leer')],
    title: 'Pronóstico de demanda',
    data: {
      breadcrumb: 'Pronóstico de demanda',
      titulo: 'Pronóstico de demanda',
      descripcion: 'Pronóstico de demanda por producto, con su nivel de confianza.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
