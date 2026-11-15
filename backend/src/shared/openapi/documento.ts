import {
  createDocument,
  type ZodOpenApiOperationObject,
  type ZodOpenApiPathsObject,
  type ZodOpenApiResponsesObject,
} from 'zod-openapi';
import { ERRORES_GENERALES, type DefinicionError } from '../http/api-error';
import { apiErrorSchema } from './esquemas';
import type { DocRuta, GrupoDocumentado } from './tipos';

/** Une el prefijo de un grupo con la ruta relativa de Express (`/` equivale al prefijo). */
export function unirRuta(prefijo: string, ruta: string): string {
  return ruta === '/' ? prefijo : `${prefijo}${ruta}`;
}

/** Convierte los parámetros de Express (`:id`) a la sintaxis de OpenAPI (`{id}`). */
export function rutaOpenApi(ruta: string): string {
  return ruta.replace(/:(\w+)/g, '{$1}');
}

/** Errores comunes que una ruta puede devolver según lo que recibe y el acceso que exige. */
function erroresComunes(ruta: DocRuta): DefinicionError[] {
  const errores: DefinicionError[] = [];
  if (ruta.params || ruta.query || ruta.body) errores.push(ERRORES_GENERALES.VALIDACION);
  if (ruta.body) errores.push(ERRORES_GENERALES.JSON_INVALIDO, ERRORES_GENERALES.CUERPO_DEMASIADO_GRANDE);
  if (!ruta.publica) errores.push(ERRORES_GENERALES.SESION_INVALIDA);
  if (ruta.permiso) errores.push(ERRORES_GENERALES.SIN_PERMISO);
  if (ruta.params) errores.push(ERRORES_GENERALES.NO_ENCONTRADO);
  errores.push(ERRORES_GENERALES.ERROR_INTERNO);
  return errores;
}

type CodigoStatus = `${1 | 2 | 3 | 4 | 5}${string}`;

function respuestas(ruta: DocRuta): ZodOpenApiResponsesObject {
  const resultado: ZodOpenApiResponsesObject = {
    [String(ruta.respuesta.status) as CodigoStatus]: {
      description: ruta.respuesta.descripcion,
      ...(ruta.respuesta.esquema ? { content: { 'application/json': { schema: ruta.respuesta.esquema } } } : {}),
    },
  };

  const porStatus = new Map<number, DefinicionError[]>();
  for (const error of [...erroresComunes(ruta), ...(ruta.errores ?? [])]) {
    const lista = porStatus.get(error.status) ?? [];
    if (!lista.some((existente) => existente.code === error.code)) lista.push(error);
    porStatus.set(error.status, lista);
  }
  for (const [status, errores] of [...porStatus].sort(([a], [b]) => a - b)) {
    resultado[String(status) as CodigoStatus] = {
      description: errores.map((error) => `\`${error.code}\`: ${error.mensaje}`).join('\n\n'),
      content: { 'application/json': { schema: apiErrorSchema } },
    };
  }
  return resultado;
}

function acceso(ruta: DocRuta): string {
  if (ruta.permiso) return `Permiso requerido: \`${ruta.permiso}\`.`;
  return ruta.publica ? 'Acceso público.' : 'Requiere sesión iniciada.';
}

function operacion(ruta: DocRuta, etiqueta: string): ZodOpenApiOperationObject {
  return {
    tags: [etiqueta],
    summary: ruta.resumen,
    description: [ruta.descripcion, acceso(ruta)].filter(Boolean).join('\n\n'),
    security: ruta.publica ? [] : [{ cookieSesion: [] }],
    ...(ruta.permiso ? { 'x-permiso': ruta.permiso } : {}),
    requestParams: {
      ...(ruta.params ? { path: ruta.params } : {}),
      ...(ruta.query ? { query: ruta.query } : {}),
    },
    ...(ruta.body ? { requestBody: { required: true, content: { 'application/json': { schema: ruta.body } } } } : {}),
    responses: respuestas(ruta),
  };
}

/** Arma el documento OpenAPI a partir de la documentación que exporta cada grupo de rutas. */
export function crearDocumento(grupos: GrupoDocumentado[]) {
  const paths: ZodOpenApiPathsObject = {};
  for (const grupo of grupos) {
    for (const ruta of grupo.rutas) {
      const path = rutaOpenApi(unirRuta(grupo.prefijo, ruta.ruta));
      paths[path] = { ...paths[path], [ruta.metodo]: operacion(ruta, grupo.etiqueta) };
    }
  }

  return createDocument({
    openapi: '3.1.0',
    info: {
      title: 'API de negocio — Champagne Florentina',
      version: '1.0.0',
      description: 'Contrato de la API de negocio. El frontend genera sus tipos a partir de este documento.',
    },
    paths,
    components: {
      securitySchemes: {
        cookieSesion: { type: 'apiKey', in: 'cookie', name: 'access_token' },
      },
    },
  });
}
