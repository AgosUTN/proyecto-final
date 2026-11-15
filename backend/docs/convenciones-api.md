# Convenciones del backend

API de negocio del ERP de Bazar Champagne Florentina. Este documento es la fuente de verdad de cómo se construye
cada módulo. Todos los CRUD siguen la misma estructura; las diferencias entre módulos están en sus reglas de
negocio, nunca en la forma de validar, responder o informar errores.

| Dato                     | Valor                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------ |
| Stack                    | Node.js · Express 5 · TypeScript · MikroORM 7 (MySQL) con decoradores legacy         |
| Prefijo de la API        | `/api`                                                                               |
| Contrato con el frontend | OpenAPI en `/api/openapi.json` y `/api/docs`; el frontend genera sus tipos desde ahí |
| Textos                   | Mensajes de error formales e impersonales, según `CLAUDE.md`                         |
| Commits                  | Conventional Commits, según `CLAUDE.md`                                              |

Documentos relacionados: `frontend/docs/arquitectura-frontend.md` (secciones 5.6 a 5.10: sesión, errores, paginación
y tipos que el frontend espera).

---

## 1. Estructura de carpetas

```
backend/src/
├─ index.ts                     arranque: configuración, ORM y servidor
├─ app.ts                       crea la app de Express (separada de index.ts para testearla con Supertest)
├─ config/
│  └─ env.ts                    variables de entorno validadas con Zod; si falta una, el servidor no arranca
├─ shared/
│  ├─ db/                       base.entity.ts, configuración de MikroORM y em()
│  ├─ http/                     api-error.ts, error-handler.ts, validar.ts, paginacion.ts, buscar-o-fallar.ts
│  ├─ auth/                     autenticar.ts, require-permission.ts, permisos.ts, sesion.ts (JWT y cookie)
│  ├─ openapi/                  armado del documento y publicación en /api/docs
│  ├─ dinero.ts                 operaciones con montos en centavos
│  └─ logger.ts                 configuración de pino
└─ modules/
   ├─ index.ts                  lista de módulos y de entidades: una línea por módulo
   ├─ auth/                     login, logout y sesión actual
   └─ <modulo>/                 un módulo por recurso (sección 2)

backend/test/                   tests de Vitest y Supertest (sección 11), fuera de src/ para que tsc no los compile
```

---

## 2. Estructura de un módulo

Cada recurso es una carpeta dentro de `modules/`. Ejemplo con categorías:

```
modules/categorias/
├─ categoria.entity.ts          entidad de MikroORM
├─ categorias.routes.ts         rutas: permiso, validación y controlador; exporta también su documentación OpenAPI
├─ categorias.schemas.ts        esquemas Zod de ENTRADA (alta, edición, página, params) y sus DTOs
├─ categorias.dto.ts            DTOs de SALIDA en Zod (fila y detalle)
├─ categorias.mapper.ts         entidad → DTO de salida
├─ categorias.service.ts        consultas al ORM y reglas de negocio
├─ categorias.controller.ts     traducción HTTP: recibe lo validado, llama al servicio, mapea y responde
└─ categorias.errors.ts         códigos de error del módulo
```

El módulo `auth` no tiene entidad propia: lee al usuario y registra su acceso a través del servicio de `usuarios`.

### 2.1 Responsabilidad de cada archivo

| Archivo           | Hace                                                                                           | No hace                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `*.routes.ts`     | Declara cada endpoint con `requirePermission` y `validar` (excepción: `auth`, sección 6.2)     | Lógica de ningún tipo                                          |
| `*.schemas.ts`    | Valida la entrada; sus tipos son los DTOs de entrada (`XAltaDto`, `XEdicionDto`, `XPaginaDto`) | Validar reglas de negocio que requieren la base de datos       |
| `*.dto.ts`        | Define la forma exacta de la respuesta (`XFilaDto`, `XDetalleDto`)                             | Exponer campos internos (contraseñas, claves técnicas sin uso) |
| `*.mapper.ts`     | Convierte entidades en DTOs de salida, con el tipo de retorno atado al DTO                     | Consultas ni reglas                                            |
| `*.service.ts`    | Consultas, reglas de negocio (citando su código RNS), transacciones; lanza `ApiError`          | Conocer `req` o `res`                                          |
| `*.controller.ts` | Toma `res.locals.validado`, llama al servicio, aplica el mapper y responde                     | Acceder al ORM, `try/catch`, traducir errores                  |
| `*.errors.ts`     | Declara los errores de negocio del módulo con su status, código y mensaje                      | —                                                              |

### 2.2 Ejemplo completo de un endpoint

```ts
// categorias.routes.ts
export const categoriasRouter = Router();

categoriasRouter.get(
  "/",
  requirePermission("parametros:editar"),
  validar({ query: categoriaPaginaSchema }),
  controller.listar,
);
categoriasRouter.get(
  "/:id",
  requirePermission("parametros:editar"),
  validar({ params: idParamsSchema }),
  controller.obtener,
);
categoriasRouter.post(
  "/",
  requirePermission("parametros:editar"),
  validar({ body: categoriaAltaSchema }),
  controller.crear,
);
categoriasRouter.put(
  "/:id",
  requirePermission("parametros:editar"),
  validar({ params: idParamsSchema, body: categoriaEdicionSchema }),
  controller.actualizar,
);
categoriasRouter.delete(
  "/:id",
  requirePermission("parametros:editar"),
  validar({ params: idParamsSchema }),
  controller.eliminar,
);
```

```ts
// categorias.schemas.ts
export const categoriaAltaSchema = z
  .object({
    nombre: z.string().trim().min(1).max(80),
    descripcion: z.string().trim().min(1).max(255),
    padreId: z.number().int().positive().nullable(),
  })
  .strict();
export type CategoriaAltaDto = z.infer<typeof categoriaAltaSchema>;

export const categoriaPaginaSchema = esquemaPagina({
  ordenables: ["nombre", "id"],
  filtros: { padreId: z.coerce.number().int().optional() },
});
```

```ts
// categorias.dto.ts
export const categoriaFilaDto = z.object({
  id: z.number(),
  nombre: z.string(),
  padre: z.string().nullable(),
});
export const categoriaDetalleDto = categoriaFilaDto.extend({
  padreId: z.number().nullable(),
  subcategorias: z.number(),
});
export type CategoriaFilaDto = z.infer<typeof categoriaFilaDto>;
export type CategoriaDetalleDto = z.infer<typeof categoriaDetalleDto>;
```

```ts
// categorias.mapper.ts
export const CategoriaMapper = {
  fila: (c: Categoria): CategoriaFilaDto => ({
    id: c.id,
    nombre: c.nombre,
    padre: c.padre?.nombre ?? null,
  }),
  detalle: (c: Categoria): CategoriaDetalleDto => ({
    ...CategoriaMapper.fila(c),
    padreId: c.padre?.id ?? null,
    subcategorias: c.subcategorias.count(),
  }),
};
```

```ts
// categorias.controller.ts
export const controller = {
  async listar(_req: Request, res: Response) {
    const pagina = await service.listar(res.locals.validado.query);
    res.json({ ...pagina, datos: pagina.datos.map(CategoriaMapper.fila) });
  },
  async crear(_req: Request, res: Response) {
    const categoria = await service.crear(res.locals.validado.body);
    res.status(201).json({ datos: CategoriaMapper.detalle(categoria) });
  },
  // obtener, actualizar y eliminar siguen el mismo patrón
};
```

```ts
// categorias.service.ts
export const service = {
  listar: (query: CategoriaPaginaDto) =>
    paginar(em(), Categoria, query, { buscarEn: ["nombre"] }),

  async crear(dto: CategoriaAltaDto): Promise<Categoria> {
    const padre = dto.padreId
      ? await buscarOFallar(Categoria, dto.padreId)
      : null; // RNS-CAT-08
    if (await existeHermana(dto.nombre, padre))
      throw new ApiError(ERRORES.NOMBRE_DUPLICADO); // RNS-CAT-13
    const categoria = em().create(Categoria, { ...dto, padre });
    await em().flush();
    return categoria;
  },
};
```

```ts
// categorias.errors.ts
export const ERRORES = {
  NOMBRE_DUPLICADO: {
    status: 409,
    code: "CATEGORIA_NOMBRE_DUPLICADO",
    mensaje: "Ya existe una categoría con ese nombre en el mismo nivel.",
  },
  CON_SUBCATEGORIAS: {
    status: 409,
    code: "CATEGORIA_CON_SUBCATEGORIAS",
    mensaje: "La categoría tiene subcategorías y no puede eliminarse.",
  },
  CICLO: {
    status: 409,
    code: "CATEGORIA_CICLO",
    mensaje:
      "La categoría no puede depender de sí misma ni de una subcategoría propia.",
  },
} as const satisfies Record<string, DefinicionError>;
```

### 2.3 Registro de módulos

`modules/index.ts` tiene una línea por módulo. `app.ts` los monta bajo `/api` sin conocerlos uno por uno:

```ts
export const MODULOS: Modulo[] = [
  { ruta: "/auth", router: authRouter, openapi: authOpenApi, publico: true },
  { ruta: "/categorias", router: categoriasRouter, openapi: categoriasOpenApi },
  // una línea por módulo
];

export const ENTIDADES = [
  Rol,
  Usuario,
  Categoria,
  // una línea por módulo
];
```

La autenticación se aplica una sola vez a todos los módulos que no son públicos. Los permisos se declaran en
cada ruta. `ENTIDADES` registra las entidades de MikroORM de forma explícita, sin rutas con comodines, para que el
ORM las encuentre igual al compilar con `tsc` y al ejecutar los tests con Vitest.

### 2.4 Reglas entre módulos

- Las reglas de negocio viven en los servicios. Los controladores no acceden al ORM y los servicios no conocen
  Express.
- Un módulo que necesita a otro llama a su **servicio**. Nunca escribe sobre entidades de otro módulo: por
  ejemplo, ventas descuenta stock a través del servicio de stock, para que las reglas de stock estén en un solo
  lugar.
- Leer relaciones entre entidades de distintos módulos a través del ORM está permitido.

---

## 3. Rutas y respuestas

### 3.1 Nombres

| Elemento            | Convención                                                 | Ejemplo                        |
| ------------------- | ---------------------------------------------------------- | ------------------------------ |
| Ruta                | Español, plural, kebab-case                                | `/api/ordenes-de-compra`       |
| Campos JSON         | Español, camelCase                                         | `padreId`, `fechaEmision`      |
| Columnas de la base | snake_case (estrategia por defecto de MikroORM)            | `padre_id`                     |
| Valores de enums    | MAYÚSCULAS con guiones bajos, como en el modelo de dominio | `PENDIENTE_APROBACION`         |
| Archivos            | kebab-case con sufijo                                      | `ordenes-de-compra.service.ts` |

### 3.2 Verbos, códigos y forma de la respuesta

| Operación         | Endpoint                      | Éxito | Cuerpo                                          |
| ----------------- | ----------------------------- | ----- | ----------------------------------------------- |
| Listar            | `GET /recursos`               | 200   | `{ datos: XFilaDto[], total, pagina, tamanio }` |
| Obtener           | `GET /recursos/:id`           | 200   | `{ datos: XDetalleDto }`                        |
| Crear             | `POST /recursos`              | 201   | `{ datos: XDetalleDto }`                        |
| Editar            | `PUT /recursos/:id`           | 200   | `{ datos: XDetalleDto }`                        |
| Eliminar          | `DELETE /recursos/:id`        | 200   | `{ datos: { baja: 'fisica' \| 'logica' } }`     |
| Acción de negocio | `POST /recursos/:id/<accion>` | 200   | `{ datos: XDetalleDto }`                        |

- `PUT` recibe el formulario completo de edición: el frontend usa un único formulario de alta y edición.
- Los cambios de estado no se hacen con `PUT`: son acciones con nombre (`POST /ventas/:id/cancelar`,
  `POST /devoluciones/:id/aprobar`), para que cada transición valide su regla.

### 3.3 Paginación, orden y filtros

Coincide con `PageQuery` del frontend.

| Parámetro          | Tipo            | Por defecto                  | Notas                                                              |
| ------------------ | --------------- | ---------------------------- | ------------------------------------------------------------------ |
| `pagina`           | entero ≥ 1      | 1                            | Empieza en 1                                                       |
| `tamanio`          | entero 1 a 100  | 25                           |                                                                    |
| `orden`            | texto           | primer valor de `ordenables` | Solo columnas de la lista blanca del módulo                        |
| `direccion`        | `asc` \| `desc` | `asc`                        |                                                                    |
| `q`                | texto, máx. 100 | —                            | Búsqueda libre en las columnas que define el módulo                |
| Filtros            | según el módulo | —                            | Parámetros propios (`padreId`, `estado`), declarados en el esquema |
| `incluirInactivos` | booleano        | `false`                      | Solo en maestros (baja lógica, sección 7.2)                        |

`esquemaPagina({ ordenables, filtros })` arma el esquema Zod y `paginar(em, entidad, query, opciones)` devuelve
`{ datos, total, pagina, tamanio }`. Nunca se ordena por una columna que llega del cliente sin pasar por la lista
blanca.

---

## 4. Validación

Middleware `validar({ params, body, query })` en `shared/http/validar.ts`:

- Valida cada parte de la request con su esquema Zod y guarda el resultado en `res.locals.validado`
  (`params`, `body`, `query`). En Express 5 `req.query` es de solo lectura: **nunca** se reasigna.
- Los esquemas de body usan `.strict()`: un campo no declarado es un error.
- Los parámetros numéricos de URL y query se convierten con `z.coerce`.
- Si falla, responde 400 con `code: 'VALIDACION'` y `campos` por cada campo inválido:

| Situación                                    | Código del campo                      |
| -------------------------------------------- | ------------------------------------- |
| Falta o es nulo cuando no se permite         | `REQUERIDO`                           |
| Tipo o formato incorrecto                    | `FORMATO_INVALIDO`                    |
| Texto más corto o más largo que lo permitido | `DEMASIADO_CORTO` · `DEMASIADO_LARGO` |
| Número fuera de rango                        | `FUERA_DE_RANGO`                      |
| Valor que no está en la lista permitida      | `VALOR_NO_PERMITIDO`                  |
| Campo no declarado                           | `CAMPO_NO_PERMITIDO`                  |

Las validaciones de forma van en el esquema. Las que necesitan la base de datos (duplicados, existencia,
ciclos) van en el servicio.

---

## 5. Errores

### 5.1 Formato único

Todas las respuestas de error tienen la forma que espera el frontend (`ApiError`):

```json
{
  "status": 409,
  "code": "CATEGORIA_CON_SUBCATEGORIAS",
  "mensaje": "La categoría tiene subcategorías y no puede eliminarse."
}
```

- `code` es estable: el frontend lo usa para elegir el texto y el lugar donde mostrarlo.
- `mensaje` es formal e impersonal. Nunca incluye detalles internos (SQL, stack, nombres de tablas).
- `campos` solo aparece en errores de validación o cuando una regla de negocio apunta a un campo
  (por ejemplo, `{ "nombre": "CATEGORIA_NOMBRE_DUPLICADO" }`). Si no hay campos, la propiedad se omite.

### 5.2 Manejador central

`shared/http/error-handler.ts` es el único lugar que arma respuestas de error. Los controladores no tienen
`try/catch`: Express 5 envía al manejador los errores de las funciones `async`.

| Origen                                        | Status              | `code`                                                                 |
| --------------------------------------------- | ------------------- | ---------------------------------------------------------------------- |
| `ApiError` lanzado por un servicio            | El de su definición | El de su definición                                                    |
| Validación de Zod                             | 400                 | `VALIDACION`                                                           |
| JSON mal formado en el body                   | 400                 | `JSON_INVALIDO`                                                        |
| Sin sesión, token vencido o usuario inactivo  | 401                 | `SESION_INVALIDA`                                                      |
| Permiso insuficiente                          | 403                 | `SIN_PERMISO`                                                          |
| `NotFoundError` de MikroORM (`buscarOFallar`) | 404                 | `NO_ENCONTRADO`                                                        |
| Ruta inexistente                              | 404                 | `RUTA_INEXISTENTE`                                                     |
| Clave única violada                           | 409                 | `DUPLICADO`                                                            |
| Clave foránea violada                         | 409                 | `EN_USO`                                                               |
| Body de más de 1 MB                           | 413                 | `CUERPO_DEMASIADO_GRANDE`                                              |
| Límite de intentos de inicio de sesión        | 429                 | `DEMASIADOS_INTENTOS`                                                  |
| Cualquier otro                                | 500                 | `ERROR_INTERNO` (se registra con su stack; la respuesta no lo incluye) |

### 5.3 Errores de negocio

Cada módulo declara los suyos en `<modulo>.errors.ts` con el prefijo del recurso
(`CATEGORIA_…`, `VENTA_…`). El servicio los lanza con `throw new ApiError(ERRORES.X)` y, si la regla apunta a un
campo, con `throw new ApiError(ERRORES.X, { campo: 'nombre' })`. Para reglas de negocio se usa 409; 422 no se
utiliza.

---

## 6. Autenticación y autorización

### 6.1 Sesión

- JWT firmado con `JWT_SECRET`, en la cookie `access_token`: `httpOnly`, `sameSite: 'strict'`,
  `secure` en producción (`NODE_ENV === 'production'`).
- **Duración:** la define `JWT_EXPIRES_IN` (`3h`), con el formato `<número><s|m|h|d>`; vale para el token y la
  cookie, sin renovación. Al vencer, el frontend recibe 401 y redirige al login conservando la ruta.
- Payload: `{ sub: idUsuario }`. Los permisos no viajan en el token: `autenticar` los lee del rol del usuario en
  cada request, de modo que un cambio de permisos o una desactivación rige de inmediato.
- Contraseñas con `bcrypt` (costo 10). El hash nunca sale de la base: ningún DTO lo incluye.

### 6.2 Endpoints

| Endpoint                | Acceso                                 | Respuesta                                                            |
| ----------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| `POST /api/auth/login`  | Público, con límite de intentos por IP | Cookie + `{ datos: UsuarioSesionDto }`                               |
| `POST /api/auth/logout` | Público                                | 204, sin cuerpo; borra la cookie                                     |
| `GET /api/auth/me`      | Autenticado                            | `{ datos: UsuarioSesionDto }` con `id`, `nombre`, `rol` y `permisos` |

- El login recibe `{ nombreUsuario, contrasena }` y actualiza `ultimo_acceso` (RNS-USU-01). Ante usuario
  inexistente, inactivo, sin contraseña o con contraseña incorrecta, la respuesta es siempre la misma (401,
  `CREDENCIALES_INVALIDAS`), para no revelar qué dato falló.
- Límite: 10 intentos fallidos por IP cada 15 minutos; los exitosos no cuentan. Al superarlo: 429,
  `DEMASIADOS_INTENTOS`.
- En `UsuarioSesionDto`, `nombre` es el nombre de usuario y `rol` es el nombre del rol.
- Las rutas de `auth` son la única excepción a `requirePermission`: login y logout son públicas y `/auth/me` solo
  exige sesión. `validar` se aplica donde la ruta recibe datos.

### 6.3 Permisos

- `autenticar` (en `shared/auth/autenticar.ts`) verifica la cookie, carga el usuario con su rol y deja en
  `res.locals.usuario` su id, nombre, rol y permisos. Si el usuario no existe o está inactivo, responde 401
  `SESION_INVALIDA`. Se aplica una sola vez a todos los módulos no públicos y, además, en `/auth/me`.
- `requirePermission('stock:ajustar')` se declara en cada ruta y responde 403 si el usuario no tiene el permiso.
  La autorización verifica permisos, nunca el nombre del rol.
- Los roles son un maestro más: el administrador los crea con un nombre y los permisos que elige (`ROL.permisos`
  en el modelo de dominio). No existen roles fijos en el código. Un rol inactivo no otorga permisos: la sesión sigue
  siendo válida, pero `requirePermission` responde 403 y `/auth/me` devuelve la lista de permisos vacía.
- El primer usuario lo crea el backend al arrancar (administrador inicial, sección 7.5).
- El catálogo de permisos, es decir, los que exigen los endpoints, vive en `shared/auth/permisos.ts` y es la misma
  lista que usa el frontend (tipo `Permiso` de `frontend/src/app/core/auth/permisos.ts`). `/auth/me` devuelve los
  permisos del usuario para que el frontend no tenga que deducirlos.

---

## 7. Persistencia

### 7.1 Entidades

- Toda entidad extiende `BaseEntity`: `id` autoincremental, `fechaCreacion` y `fechaUltimaModificacion`
  automáticos, como en el modelo de dominio.
- Los maestros agregan `activo: boolean` (por defecto `true`) para la baja lógica.
- Las relaciones se declaran según el modelo de dominio. Los atributos derivados del modelo no se almacenan: se
  calculan en el servicio o en la consulta.
- Montos: `DECIMAL(12,2)` en la base. En el servicio se opera en centavos (enteros) con `shared/dinero.ts`, nunca
  con `number` decimal. En JSON viajan como número con dos decimales.
- Fechas: se guardan en UTC y viajan en ISO 8601. La zona de Argentina se aplica solo al mostrar.
- Estados: enums de TypeScript con los valores del modelo.

### 7.2 Bajas

El servicio decide en `eliminar()`. Todos los maestros siguen el mismo criterio:

1. **Si una regla de negocio impide la baja** (por ejemplo, RNS-CAT-09: categoría con subcategorías; o un rol con
   usuarios activos, según el modelo de dominio): 409 con el código de esa regla.
2. **Maestro utilizado**, es decir, con al menos un registro de otra entidad que lo referencia (por ejemplo, una
   categoría con productos, RNS-CAT-10): baja lógica (`activo = false`). Los listados la ocultan salvo con
   `incluirInactivos=true`.
3. **Maestro sin utilizar:** baja física.

La respuesta informa qué baja se aplicó, para que el frontend muestre «eliminado» o «desactivado».

### 7.3 Transacciones y concurrencia

- Cada request usa su propio `EntityManager` (`RequestContext`). Los servicios lo obtienen con `em()`.
- Toda operación que escribe más de una entidad se ejecuta dentro de `em().transactional(...)`. Dentro del callback,
  `em()` devuelve el EntityManager de la transacción, de modo que los servicios de otros módulos que se llamen ahí
  participan de ella.
- Las operaciones sobre stock bloquean la fila (`LockMode.PESSIMISTIC_WRITE`) para evitar ventas simultáneas de
  la misma unidad.

### 7.4 Auditoría

Se auditan los maestros (RNS-AUD). Un subscriber de MikroORM registrará sus altas, modificaciones y bajas, con el
usuario de la sesión y los valores anteriores y nuevos. Las entidades auditadas se marcan en su definición; el
servicio no escribe la auditoría a mano.

**Pendiente:** el mecanismo se incorpora después del primer maestro, una vez definidos en el modelo de dominio los
atributos de `OBJETO_AUDITORIA` que requiere.

### 7.5 Esquema de la base de datos

- El esquema se sincroniza al arrancar con `orm.schema.update({ safe: true })`: crea tablas y columnas, pero no
  borra. Para sumar una entidad alcanza con registrarla en `ENTIDADES` (sección 2.3).
- Por ahora no se usan migraciones ni seeders.
- Única excepción, el **administrador inicial**: al arrancar, si la tabla `usuario` está vacía, el backend crea el rol
  «Administrador» con todos los permisos del catálogo y el usuario definido por `ADMIN_USUARIO`, `ADMIN_EMAIL` y
  `ADMIN_CONTRASENA`. Si ya existen usuarios, no hace nada; si faltan esas variables, lo informa en el log. Cada
  entorno define las suyas en `.env`: ninguna credencial queda en el repositorio.

---

## 8. Contrato OpenAPI

- Los esquemas Zod de entrada (`*.schemas.ts`) y de salida (`*.dto.ts`) generan el documento OpenAPI. No se
  escriben tipos de request ni de respuesta a mano.
- Cada `*.routes.ts` exporta, además del router, la documentación de sus rutas (método, ruta, permiso, esquemas de
  entrada, DTO de respuesta y códigos de error del módulo).
- Se publica en `GET /api/openapi.json` y `GET /api/docs`.
- Un test verifica que toda ruta montada en Express esté documentada.
- Después de cambiar un DTO, el frontend regenera sus tipos; si quedó algo incompatible, el frontend no compila.

---

## 9. Logs

- Se usa `pino` con `pino-http`: cada request queda registrada con método, ruta, status, duración y un
  identificador único (`x-request-id`). Los errores 500 se registran con su stack y ese identificador.
- En desarrollo la salida es legible (`pino-pretty`); en producción es JSON.
- Nunca se registran contraseñas, cookies ni tokens (`redact` en la configuración).
- No se usa `console.log` en el código del backend.

---

## 10. Seguridad general

- `helmet` para cabeceras de seguridad.
- CORS solo para `CORS_ORIGIN`, con `credentials: true`. Es la misma variable que usa `ds-api`.
- Límite de tamaño del body (`express.json({ limit: '1mb' })`); la subida de archivos se define con su propio
  límite cuando exista.
- Límite de intentos en `POST /api/auth/login` (`express-rate-limit`, sección 6.2).
- Variables de entorno validadas en `config/env.ts` (por ejemplo, `JWT_SECRET` de al menos 32 caracteres; las
  `ADMIN_*` son opcionales, sección 7.5); los secretos solo viven en `.env`, que no se versiona.

---

## 11. Tests

- Vitest para tests unitarios y Supertest para endpoints, contra la base de prueba `<DB_NAME>_test` del mismo
  servidor MySQL. Al iniciar, los tests regeneran su esquema y cada archivo limpia las tablas antes de cada caso.
- Los tests viven en `backend/test/` y se ejecutan dentro del contenedor: `docker compose exec backend npm test`.
  La base de prueba la crea el script de inicialización de MySQL (`mysql/init/`) al crear el volumen.
- Cada regla de negocio tiene al menos un test que la cita en su nombre
  (`it('RNS-CAT-13: rechaza un nombre repetido entre hermanas')`).
- Cada endpoint tiene al menos el caso exitoso y su error más probable (validación, permiso o regla).
- El test de documentación OpenAPI (sección 8) corre siempre.

---

## 12. Dependencias

| Uso           | Paquete                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------- |
| Validación    | `zod`                                                                                           |
| Contrato      | `zod-openapi` (o equivalente compatible con la versión de Zod instalada) y `swagger-ui-express` |
| Sesión        | `jsonwebtoken`, `bcrypt`, `cookie-parser`                                                       |
| Seguridad     | `helmet`, `cors`, `express-rate-limit`                                                          |
| Logs          | `pino`, `pino-http`; `pino-pretty` en desarrollo                                                |
| Base de datos | `@mikro-orm/core`, `@mikro-orm/mysql`; `@mikro-orm/decorators` y `reflect-metadata` (decoradores legacy) |
| Tests         | `vitest`, `supertest`                                                                           |
| Tipos         | `@types/*` de los paquetes que no incluyen sus propios tipos                                    |

`package.json` declara solo dependencias directas. Cualquier dependencia nueva se acuerda antes de agregarla.

---

## 13. Agregar un módulo

1. Crear `modules/<modulo>/` con los ocho archivos de la sección 2.
2. Agregar en `modules/index.ts` la línea del módulo en `MODULOS` y sus entidades en `ENTIDADES`.
3. Escribir los tests de sus reglas y endpoints.
4. Verificar que aparece completo en `/api/docs` y avisar al frontend para regenerar los tipos.

### Definición de terminado

- [ ] Build sin errores y tests en verde.
- [ ] Todas las rutas con `requirePermission` y `validar` (salvo la excepción de `auth`), y documentadas en OpenAPI.
- [ ] Respuestas a través del mapper; ningún controlador devuelve una entidad.
- [ ] Reglas de negocio en el servicio, citando su código RNS, con su test.
- [ ] Errores del módulo en `<modulo>.errors.ts`, con mensajes según `CLAUDE.md`.
- [ ] Bajas según la sección 7.2.
- [ ] Entidades registradas en `ENTIDADES`.
