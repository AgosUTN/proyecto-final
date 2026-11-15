import type { Express } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { MODULOS } from '../src/modules';
import { rutaOpenApi, unirRuta } from '../src/shared/openapi/documento';
import { RUTAS_DE_DOCUMENTACION } from '../src/shared/openapi/publicar';
import { usarContextoDePrueba } from './apoyo/contexto';

interface CapaExpress {
  route?: { path: string; methods: Record<string, boolean> };
  handle?: { stack?: unknown };
}

function rutasDeCapas(capas: CapaExpress[], prefijo: string): string[] {
  return capas.flatMap((capa) =>
    capa.route
      ? Object.keys(capa.route.methods).map(
          (metodo) => `${metodo.toUpperCase()} ${rutaOpenApi(unirRuta(prefijo, capa.route!.path))}`,
        )
      : [],
  );
}

/** Rutas montadas en Express: las propias de la app y las de cada router de `MODULOS`. */
function rutasMontadas(app: Express): string[] {
  const capasApp = (app as unknown as { router: { stack: CapaExpress[] } }).router.stack;
  const propias = rutasDeCapas(capasApp, '').filter(
    (ruta) => !RUTAS_DE_DOCUMENTACION.some((excluida) => ruta.endsWith(` ${excluida}`)),
  );
  const deModulos = MODULOS.flatMap((modulo) =>
    rutasDeCapas(modulo.router.stack as unknown as CapaExpress[], `/api${modulo.ruta}`),
  );
  return [...propias, ...deModulos].sort();
}

async function rutasDocumentadas(app: Express): Promise<string[]> {
  const { body } = await request(app).get('/api/openapi.json').expect(200);
  return Object.entries(body.paths as Record<string, Record<string, unknown>>)
    .flatMap(([ruta, operaciones]) => Object.keys(operaciones).map((metodo) => `${metodo.toUpperCase()} ${ruta}`))
    .sort();
}

describe('Contrato OpenAPI', () => {
  const contexto = usarContextoDePrueba();

  it('documenta toda ruta montada en Express', async () => {
    const documentadas = await rutasDocumentadas(contexto.app);
    expect(rutasMontadas(contexto.app).filter((ruta) => !documentadas.includes(ruta))).toEqual([]);
  });

  it('no documenta rutas inexistentes', async () => {
    const montadas = rutasMontadas(contexto.app);
    expect((await rutasDocumentadas(contexto.app)).filter((ruta) => !montadas.includes(ruta))).toEqual([]);
  });

  it('solo monta routers registrados en MODULOS', () => {
    const capasApp = (contexto.app as unknown as { router: { stack: CapaExpress[] } }).router.stack;
    const routers = capasApp.filter((capa) => Array.isArray(capa.handle?.stack)).map((capa) => capa.handle);
    expect(routers.every((router) => MODULOS.some((modulo) => modulo.router === router))).toBe(true);
  });

  it('publica la interfaz navegable en /api/docs', async () => {
    const respuesta = await request(contexto.app).get('/api/docs/').expect(200);
    expect(respuesta.text).toContain('swagger-ui');
  });
});
