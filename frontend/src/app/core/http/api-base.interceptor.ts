import { HttpInterceptorFn } from '@angular/common/http';

/** Prefijo lógico de las URLs de la API de ciencia de datos: `'ds:pronostico'` → `/ds-api/pronostico`. */
export const PREFIJO_DS_API = 'ds:';

/**
 * Antepone la ruta base de cada API (arquitectura-frontend.md, sección 5.7). Los servicios piden URLs lógicas
 * relativas (`'categorias'`, `'ds:pronostico'`) y este interceptor las convierte en `/api/…` o `/ds-api/…`, que el
 * proxy de desarrollo y nginx resuelven en el mismo origen. Las URLs absolutas o que empiezan con `/` no se tocan.
 */
export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;
  if (url.startsWith('/') || /^[a-z]+:\/\//i.test(url)) return next(req);

  const destino = url.startsWith(PREFIJO_DS_API)
    ? `/ds-api/${url.slice(PREFIJO_DS_API.length)}`
    : `/api/${url}`;
  return next(req.clone({ url: destino }));
};
