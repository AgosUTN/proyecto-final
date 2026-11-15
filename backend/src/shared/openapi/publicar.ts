import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import type { crearDocumento } from './documento';

/** Rutas que publican la documentación. No forman parte del contrato documentado. */
export const RUTAS_DE_DOCUMENTACION = ['/api/openapi.json', '/api/docs'] as const;

/** Publica el contrato en `/api/openapi.json` y la interfaz navegable en `/api/docs`. */
export function publicarDocumentacion(app: Express, documento: ReturnType<typeof crearDocumento>): void {
  app.get('/api/openapi.json', (_req, res) => {
    res.json(documento);
  });
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(documento, { customSiteTitle: 'API de negocio — Champagne Florentina' }),
  );
}
