import { Routes } from '@angular/router';

// Pantalla provisoria hasta implementar la feature: reemplazar loadComponent por './pages/<pagina>'
// y agregar permissionGuard('analisis:leer') cuando exista AuthStore (arquitectura-frontend.md, 5.6).
export default [
  {
    path: '',
    title: 'Pronóstico de demanda',
    data: {
      breadcrumb: 'Pronóstico de demanda',
      titulo: 'Pronóstico de demanda',
      descripcion: 'Pronóstico de demanda por producto, con su nivel de confianza.',
    },
    loadComponent: () => import('@shared/ui/pagina-pendiente/pagina-pendiente'),
  },
] satisfies Routes;
