import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/permission.guard';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'.
export default [
  {
    path: '',
    canActivate: [permissionGuard('productos:leer')],
    title: 'Productos',
    data: {
      breadcrumb: 'Productos',
      titulo: 'Productos',
      descripcion:
        'Catálogo de productos y variantes, con precios, costos, fotos y publicación en la tienda online y Mercado Libre.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
