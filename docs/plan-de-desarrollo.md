# Plan de desarrollo — Champagne Florentina

Plan de trabajo del equipo (Bruno, Agostino y Leo) para construir frontend y backend del alcance de esta entrega.
Define el orden de construcción a partir del modelo de dominio, la división de tareas, el flujo de ramas y las
reglas comunes que permiten trabajar en paralelo sin bloquearse.

| Dato | Valor |
|---|---|
| Versión | 1.0 — 14/11/2026 |
| Arquitectura del frontend | [`frontend/docs/arquitectura-frontend.md`](../frontend/docs/arquitectura-frontend.md) |
| Modelo de dominio | `Entrega 3/html-docs-V2` (StarUML, 36 clases, 56 asociaciones) |
| Reglas de negocio | Etapa 3 (Google Doc «Proyecto - Entrega 3», versión del 19/10/2026) |
| Alcance | Seguridad, Stock, Venta en mostrador; Mercado Pago al final; sin otras integraciones |
| Estimación de la Etapa 3 | 137 PF ajustados ≈ 54 días con 3 personas |

---

## Índice

1. [Principios de trabajo](#1-principios-de-trabajo)
2. [Clasificación del modelo de dominio](#2-clasificación-del-modelo-de-dominio)
3. [Orden de construcción](#3-orden-de-construcción)
4. [Flujo de ramas e integración](#4-flujo-de-ramas-e-integración)
5. [Fase 0 · Decisiones previas](#5-fase-0--decisiones-previas)
6. [Fase 1 · Fundaciones](#6-fase-1--fundaciones)
7. [Fase 2 · Maestros](#7-fase-2--maestros)
8. [Fase 3 · Transaccionales](#8-fase-3--transaccionales)
9. [Fase 4 · Mercado Pago y cierre](#9-fase-4--mercado-pago-y-cierre)
10. [Resumen de asignaciones](#10-resumen-de-asignaciones)
11. [Arquitectura mínima del backend](#11-arquitectura-mínima-del-backend)
12. [Definición de terminado](#12-definición-de-terminado)
13. [Diferencias entre el modelo de dominio y las reglas de negocio](#13-diferencias-entre-el-modelo-de-dominio-y-las-reglas-de-negocio)

---

## 1. Principios de trabajo

1. **Cortes verticales.** Cada persona construye una funcionalidad completa: entidad, endpoint, pantalla y tests.
   Nadie es «el de backend» ni «el de frontend».
2. **Contrato primero.** Antes de programar una funcionalidad se acuerda su contrato HTTP (rutas, DTOs, códigos
   de error) y se publica en OpenAPI. Con el contrato publicado, quien depende de esa funcionalidad puede avanzar
   en paralelo.
3. **Maestros antes que transaccionales.** Ninguna transacción se construye sobre un maestro que todavía no existe.
4. **Integración frecuente.** Lo terminado entra a `develop` en cuanto cumple la definición de terminado
   (sección 12), no al final de la fase.
5. **Las reglas de negocio de la Etapa 3 prevalecen** sobre el modelo de dominio cuando se contradicen
   (sección 13): las reglas son posteriores y documentan los cambios con la marca «Antes:».

---

## 2. Clasificación del modelo de dominio

### 2.1 Clases del alcance actual

| Tipo | Clase | Módulo | Notas |
|---|---|---|---|
| Base técnica | `BaseEntity` | Transversal | `fecha_creacion`, `fecha_ultima_modificacion` (RNS-AUD-06) |
| Catálogo fijo | `ROL` | Seguridad | 6 valores fijos (RNS-ROL-01); se cargan por seed |
| Maestro | `USUARIO` | Seguridad | Empleados con contraseña obligatoria (RNS-USU-03) |
| Maestro | `CATEGORÍA` | Catálogo | Jerárquica, sin ciclos; productos solo en hojas (RNS-CAT) |
| Maestro | `PROVEEDOR` | Catálogo | Requerido: todo producto tiene al menos un proveedor (RNS-OC-10) |
| Maestro | `PRODUCTO` | Catálogo | `codigo_interno` único; `stock_minimo` |
| Historial de maestro | `PRODUCTO_PRECIO`, `PRODUCTO_COSTO` | Catálogo | Vigencia por fecha; el vigente es el más reciente no futuro (RNS-STK-18) |
| Maestro débil | `PRODUCTO_VARIANTE` | Catálogo | SKU generado; exactamente una principal (RNS-STK-02/11) |
| Maestro débil | `VARIANTE_FOTO` | Catálogo | Orden de visualización; la principal requiere foto (RNS-STK-03/04) |
| Estado derivado | `STOCK_DISPONIBLE` | Stock | 1:1 con la variante; se crea junto con ella (RNS-MOV-09) |
| Catálogo fijo | `CANAL_VENTA` | Ventas | Seed: MOSTRADOR, MERCADO_LIBRE, ECOMMERCE_PROPIO, REDES_SOCIALES |
| Catálogo fijo | `MEDIO_PAGO` | Ventas | Seed: EFECTIVO, DEBITO, CREDITO (RNS-MPG-01) |
| Transaccional | `MOVIMIENTO_STOCK` | Stock | Inmutable; ajuste manual con motivo (RNS-MOV) |
| Transaccional | `VENTA` + `LINEA_VENTA` | Ventas | Totales y precios congelados (RNS-VENTA-07/10/11) |
| Transaccional | `CUOTA` | Ventas | Contado: una sola cuota (RNS-CUO-06) |
| Transaccional | `COMPROBANTE` | Ventas | Sin ARCA: se emite sin CAE, con numeración por punto de venta (RNS-CMP-07) |

### 2.2 Clases fuera del alcance actual

`CLIENTE_MINORISTA`, `CLIENTE_MAYORISTA`, `DESCUENTO`, `POLITICA_DEVOLUCION`, `DEVOLUCIÓN`, `EVALUACION`,
`PEDIDO`, `BULTO`, `ORDEN_COMPRA`, `LINEA_ORDEN_COMPRA`, `RECEPCIÓN_MERCADERÍA`, `LINEA_RECEPCIÓN`,
`COMPROMISO_PAGO`, `PAGO_PROVEEDOR`, `CUENTA_CORRIENTE_PROVEEDOR`, `DOCUMENTO_DIGITALIZADO`, `PAGO_CLIENTE`,
`OBJETO_AUDITORIA`.

Las ventas de mostrador no tienen cliente (RNS-CLI-02), así que el POS no depende de los clientes.

### 2.3 Dependencias entre clases

```
ROL ──► USUARIO ───────────────────────────────────────────────┐
                                                               │ (vendedor)
CATEGORÍA ──┐                                                  ▼
            ├──► PRODUCTO ──► PRODUCTO_PRECIO / _COSTO       VENTA ──► LINEA_VENTA ──► MOVIMIENTO_STOCK
PROVEEDOR ──┘        │                                         ▲   ├──► CUOTA          (VENTA_MOSTRADOR)
                     ▼                                         │   └──► COMPROBANTE
              PRODUCTO_VARIANTE ──► VARIANTE_FOTO              │
                     │                                         │
                     └──► STOCK_DISPONIBLE ◄── MOVIMIENTO_STOCK (AJUSTE_INVENTARIO)
                                                               │
CANAL_VENTA, MEDIO_PAGO ───────────────────────────────────────┘
```

---

## 3. Orden de construcción

| Fase | Contenido | Duración orientativa | Condición de salida |
|---|---|---|---|
| 0 | Decisiones previas | 2 a 3 días | Decisiones de la sección 5 registradas |
| 1 | Fundaciones (backend, frontend, seguridad) | 1,5 semanas | Login funcionando de punta a punta con la estructura base |
| 2 | Maestros | 2,5 semanas | ABM de categorías, proveedores, productos, variantes, usuarios y consulta de stock |
| 3 | Transaccionales | 2,5 semanas | Ajuste de stock y venta en mostrador completa con comprobante |
| 4 | Mercado Pago y cierre | 1 semana | Cobro con débito y crédito; pruebas e2e; entrega |

Total orientativo: unas 8 semanas, coherente con la estimación de la Etapa 3. Las fechas se fijan contra el
Gantt vigente.

---

## 4. Flujo de ramas e integración

### 4.1 Ramas

```
main ─────────────────────────────────────────────●───────── (solo entregas)
  │                                               ▲
develop ──●────●────●────●────●────●────●────●────●───────── (integración)
           ▲    ▲    ▲    ▲    ▲    ▲    ▲    ▲
bruno    ──┴────┼────┴────┼────┴────┼────┴────┼──
agostino ───────┴────┬────┴─────────┼─────────┴──
leo      ────────────┴──────────────┴────────────
```

| Rama | Uso | Quién escribe |
|---|---|---|
| `main` | Versión entregada. Solo recibe merges de `develop` en cada hito | Por acuerdo del equipo |
| `develop` | Integración. Siempre compila y pasa los tests | Merges desde las ramas personales |
| `bruno`, `agostino`, `leo` | Trabajo de cada integrante, creadas desde `develop` | Su dueño |

### 4.2 Reglas

1. **Sincronizar todos los días:** antes de empezar, cada uno trae `develop` a su rama
   (`git pull origin develop` o `git rebase develop`).
2. **Integrar cada tarea terminada:** cuando una tarea cumple la definición de terminado, se mergea a `develop`
   mediante pull request. Como mínimo dos veces por semana; nunca una fase entera de golpe.
3. **Revisión cruzada:** cada pull request lo aprueba otro integrante antes del merge.
4. **`develop` nunca queda roto:** si un merge rompe el build, se corrige o se revierte en el momento.
5. **Commits** según `CLAUDE.md`: Conventional Commits en una línea, con el módulo como ámbito
   (`feat(productos): registrar variantes con sku generado`).
6. **Archivos compartidos** (`app.routes.ts`, `nav.config.ts`, `permisos.ts`, seeds, registro de rutas del
   backend): cambios chicos y mergeados rápido, para reducir conflictos.
7. **Migraciones:** una migración por cambio de entidad, generada por quien modifica la entidad. Antes de generar
   una nueva, sincronizar con `develop` para no duplicar numeraciones.
8. Nadie pushea a `main` sin acuerdo del equipo.

---

## 5. Fase 0 · Decisiones previas

Reunión del equipo antes de escribir código. Cada decisión se registra en este documento o en la arquitectura.

| # | Decisión | Propuesta |
|---|---|---|
| D1 | Fuente de verdad ante contradicciones entre modelo y reglas | Prevalecen las reglas de la Etapa 3; el modelo se actualiza (sección 13) |
| D2 | Roles y matriz de permisos | 6 roles de RNS-ROL-01 y matriz de la sección 5.6 de la arquitectura |
| D3 | Medios de pago del POS | Los 3 de RNS-MPG-01; transferencia y QR quedan fuera |
| D4 | Producto: código y marca | `codigo_interno` en el producto, SKU por variante; sin entidad Marca en esta entrega |
| D5 | Precio del producto | Solo historial (`PRODUCTO_PRECIO` / `PRODUCTO_COSTO`); se eliminan `precio_venta_publico` y `precio_costo_base` del producto |
| D6 | Comprobante sin ARCA | TICKET (letra X) por defecto y FACTURA B sin CAE; numeración propia por punto de venta |
| D7 | Venta pendiente de facturación | No se modela en esta entrega (sin ARCA no hay rechazo de facturación) |
| D8 | Carga inicial de stock | Movimiento `AJUSTE_INVENTARIO` con motivo «Carga inicial» |
| D9 | Ubicación en depósito (CUU1.1) | Fuera de esta entrega, salvo que el equipo decida agregar el atributo a la variante |
| D10 | Contrato de error del backend | Formato `ApiError` de la arquitectura (sección 5.7) |
| D11 | Esquema de la base | Migraciones de MikroORM; se elimina `schema.update` del arranque |
| D12 | Descuentos en el POS | Fuera de esta entrega (CUU9.3 no está en el alcance del prototipo) |

---

## 6. Fase 1 · Fundaciones

Las tres tareas se hacen en paralelo y no dependen entre sí, salvo el contrato de login, que se acuerda el primer
día.

### Bruno · Fundaciones del frontend

- Aliases (`@core`, `@shared`, `@features`, `@layout`), ESLint con `angular-eslint` y `eslint-plugin-boundaries`.
- Tokens de color y tipografía desde el prototipo; fuentes con `@fontsource`.
- `proxy.conf.json` y ajuste de `nginx.conf` para `/api` y `/ds-api`.
- `core/http`: interceptors, `ApiError`, catálogo de errores, `applyServerErrors`.
- `layout/`: shell, barra lateral desde `nav.config.ts`, barra superior, migas, encabezado de página.
- `shared/ui` inicial: `button`, `field`, `estado`, `tag`, `panel`, `aviso`, `skeleton`, `empty-state`,
  `confirm-dialog`, `data-table`, `icon`.
- `shared/data-access`: `crudApi` y `PageQuery`.
- Pipes `ars`, `numero`, `fecha`.

### Agostino · Fundaciones del backend

- Limpieza de `package.json` (hoy lista dependencias transitivas de Express como directas).
- Estructura por módulos (sección 11), `BaseEntity` con fechas automáticas.
- Migraciones y seeds de MikroORM (roles, canales de venta, medios de pago, usuario gerente inicial).
- Middleware de errores con el formato `ApiError`, validación de entrada con esquemas (Zod).
- Paginación, orden y filtros comunes para listados.
- OpenAPI generado desde los esquemas; script del frontend para generar los tipos.
- Tests de integración con base de datos de prueba.

### Leo · Seguridad de punta a punta

- Backend: entidades `ROL` y `USUARIO`, hash de contraseña, login con JWT en cookie httpOnly, `/auth/me`,
  cierre de sesión, middleware de autenticación y de permisos, registro de `ultimo_acceso` (RNS-USU-01).
- Frontend: feature `auth` (login), `AuthStore`, `authGuard`, `permissionGuard`, directiva `*can`,
  `permisos.ts` con la matriz de roles.

**Salida de la fase:** un usuario del seed inicia sesión, ve el shell con el menú filtrado por su rol y cierra
sesión.

---

## 7. Fase 2 · Maestros

Cada integrante toma un bloque completo (backend + frontend). Los contratos se publican al inicio de la fase
para que el bloque B pueda avanzar mientras A termina.

### Bloque A · Agostino — Categorías y proveedores

| Entidad | Backend | Frontend | Reglas |
|---|---|---|---|
| `CATEGORÍA` | ABM, árbol completo, validación de ciclos, hermanas con nombre único | `config/categorias`: árbol con alta, edición, movimiento y baja | RNS-CAT-02 a 14 |
| `PROVEEDOR` | ABM con CUIT único y estado activo | `compras/proveedores`: listado, alta y edición (solo datos maestros) | RNS-OC-09 (inactivo) |

Primero se entrega `CATEGORÍA`, porque el bloque B la necesita.

### Bloque B · Bruno — Productos y variantes

| Entidad | Backend | Frontend | Reglas |
|---|---|---|---|
| `PRODUCTO` | ABM, categoría hoja, al menos un proveedor, `codigo_interno` único | `inventario/productos`: listado y `form-page` | CUU9.1, RNS-CAT-06, RNS-OC-10 |
| `PRODUCTO_PRECIO` / `PRODUCTO_COSTO` | Alta con vigencia, consulta del vigente e historial | Historial de precios en el detalle | CUU9.2, RNS-STK-15/16/18 |
| `PRODUCTO_VARIANTE` | Alta con atributos, generación de SKU, variante principal, creación de `STOCK_DISPONIBLE` en 0 | Editor de variantes dentro del producto | CUU9.4, RNS-STK-01/02/07 a 14 |
| `VARIANTE_FOTO` | Subida de imágenes, orden, foto obligatoria en la principal | Carga y orden de fotos | RNS-STK-03 a 06 |

Mientras el bloque A no entrega categorías y proveedores, se trabaja con datos del seed.

### Bloque C · Leo — Usuarios y consulta de stock

| Entidad | Backend | Frontend | Reglas |
|---|---|---|---|
| `USUARIO` | ABM de empleados, asignación de rol, activación y baja lógica | `config/usuarios` | RNS-USU-03, RNS-ROL-01/02 |
| `STOCK_DISPONIBLE` | Listado por variante con filtros (categoría, sin stock, bajo mínimo) y detalle | `inventario/stock`: tabla con variantes expandibles y panel de detalle | CUU1.1, RNS-MOV-07 |

La consulta de stock se construye contra el contrato de variantes del bloque B; hasta su merge, se prueba con
datos del seed.

**Salida de la fase:** se puede cargar el catálogo completo desde la interfaz y consultar el stock de cada variante.

---

## 8. Fase 3 · Transaccionales

### Leo · Movimientos de stock

- Backend: `MOVIMIENTO_STOCK` inmutable, actualización atómica de `STOCK_DISPONIBLE`, rechazo de stock negativo
  con bloqueo de fila, tipos `AJUSTE_INVENTARIO`, `PÉRDIDA`, `VENTA_MOSTRADOR` y `REVERSION_VENTA`.
- Frontend: diálogo de ajuste manual en `inventario/stock` y lista de movimientos en el panel de detalle.
- Reglas: CUU9.5, RNS-MOV-01 a 09, RNS-VMO-03/04.
- Es la base de la venta: se entrega primero dentro de la fase y expone un servicio interno que usa el módulo de
  ventas.

### Agostino · Venta en el backend

- `VENTA`, `LINEA_VENTA`, `CUOTA` (contado: una cuota) y `COMPROBANTE` sin CAE con numeración propia.
- Registro de la venta en una transacción: valida stock, congela precios y totales, genera los movimientos
  `VENTA_MOSTRADOR`, crea la cuota y el comprobante.
- Cancelación de una venta completada con `REVERSION_VENTA` y nota de crédito.
- Máquina de estados de la venta limitada a lo aplicable al mostrador (PENDIENTE, COMPLETADA, ENTREGADA,
  CANCELADA).
- Reglas: CUU1.2, CUU1.3, RNS-VENTA-01 a 16, RNS-CUO-01 a 06, RNS-CMP-01 a 07, RNS-VMO-01/03/04.

### Bruno · Venta en el frontend

- `ventas/mostrador` según la guía 10.2: búsqueda con lector de código, tarjetas con stock, ticket, medios de
  pago, cobro, comprobante imprimible y atajos de teclado.
- `ventas/historial`: listado con estados, detalle de la venta con su comprobante y cancelación (con permiso
  `ventas:cancelar`).
- Se construye contra el contrato de ventas publicado por Agostino al inicio de la fase.

**Salida de la fase:** una venta en mostrador descuenta stock, emite su comprobante y queda en el historial; su
cancelación repone el stock.

---

## 9. Fase 4 · Mercado Pago y cierre

| Tarea | Responsable |
|---|---|
| Integración con Mercado Pago (backend): creación del cobro, webhook de confirmación, estado PENDIENTE → COMPLETADA | Agostino |
| Integración con Mercado Pago (frontend): estado del cobro en el POS, rechazo y reintento (CUU1.2, camino 2.a) | Bruno |
| Pruebas e2e (login, alta de producto con variante, venta en mostrador), datos de demostración, documentación de instalación | Leo |
| Revisión final contra el checklist de la guía 17 y merge a `main` | Todo el equipo |

---

## 10. Resumen de asignaciones

| Fase | Bruno | Agostino | Leo |
|---|---|---|---|
| 1 · Fundaciones | Frontend base y `shared/ui` | Backend base, migraciones, OpenAPI | Seguridad completa |
| 2 · Maestros | Productos, precios, variantes, fotos | Categorías y proveedores | Usuarios y consulta de stock |
| 3 · Transaccionales | POS e historial de ventas (frontend) | Venta, cuotas y comprobante (backend) | Movimientos y ajuste de stock |
| 4 · Cierre | Mercado Pago (frontend) | Mercado Pago (backend) | Pruebas e2e y demo |

Criterio de la asignación: Bruno definió la arquitectura del frontend, así que arranca su base. Agostino arma la
base del backend (la referencia analizada, App-web, tiene un backend Node/Express con la misma pila). Leo toma la
seguridad, que atraviesa ambas capas. En las fases siguientes cada uno trabaja en las dos capas. La asignación
puede cambiarse por acuerdo del equipo sin alterar el orden de las fases.

---

## 11. Arquitectura mínima del backend

Se define acá lo necesario para trabajar en paralelo. Si crece, se pasa a un documento propio en `backend/docs/`.

```
backend/src/
├─ index.ts                     arranque: ORM, middlewares, rutas
├─ config/                      variables de entorno validadas
├─ shared/
│  ├─ db/                       BaseEntity, configuración de MikroORM
│  ├─ http/                     error-handler, ApiError, paginación, validación con Zod
│  ├─ auth/                     authenticate, requirePermission(permiso)
│  └─ openapi/                  registro de esquemas y publicación en /api/docs
├─ modules/
│  ├─ auth/                     login, logout, me
│  ├─ usuarios/
│  ├─ categorias/
│  ├─ proveedores/
│  ├─ productos/                producto, precios, costos, variantes, fotos
│  ├─ stock/                    stock disponible y movimientos
│  └─ ventas/                   venta, líneas, cuotas, comprobantes
├─ migrations/
└─ seeders/
```

Cada módulo contiene:

```
modules/<modulo>/
├─ <entidad>.entity.ts          entidad de MikroORM
├─ <modulo>.schemas.ts          esquemas Zod de entrada y salida (generan OpenAPI)
├─ <modulo>.service.ts          reglas de negocio y transacciones
├─ <modulo>.controller.ts       traducción HTTP ↔ servicio, sin lógica de negocio
└─ <modulo>.routes.ts           rutas con requirePermission
```

**Reglas:**

- Las reglas de negocio viven en los servicios; los controladores no acceden al ORM directamente.
- Un módulo usa a otro solo a través de su servicio (por ejemplo, ventas llama a `stock.service`).
- Las operaciones que tocan stock usan transacción y bloqueo de fila (riesgo R08).
- Toda respuesta de error usa `ApiError`; los listados devuelven `{ datos, total }`.
- Rutas en español y en plural: `/api/productos`, `/api/productos/:id/variantes`.
- Los códigos de error se documentan en OpenAPI y se agregan al catálogo del frontend.

---

## 12. Definición de terminado

Una tarea entra a `develop` solo si cumple todo lo siguiente:

- [ ] Contrato publicado en OpenAPI y tipos del frontend regenerados.
- [ ] Reglas de negocio aplicadas en el backend y citadas en el código o en los tests por su código (RNS-, CUU).
- [ ] Tests del backend para el camino principal y los caminos alternativos del caso de uso.
- [ ] Pantalla según la arquitectura del frontend y el checklist de la guía 17.
- [ ] Estados de carga, vacío y error con «Reintentar».
- [ ] Permisos aplicados en backend y frontend.
- [ ] Textos revisados con las reglas de `CLAUDE.md`.
- [ ] Lint y build sin errores; pull request aprobado por otro integrante.

---

## 13. Diferencias entre el modelo de dominio y las reglas de negocio

El modelo de StarUML (09/10/2026) es anterior a las reglas de la Etapa 3 (19/10/2026). Diferencias encontradas al
analizar las 36 clases y 56 asociaciones:

| # | Diferencia | Modelo | Reglas | Resolución propuesta |
|---|---|---|---|---|
| M1 | Precio y costo del producto | Atributos `precio_costo_base` y `precio_venta_publico` en `PRODUCTO` | Historial en `PRODUCTO_PRECIO` / `PRODUCTO_COSTO` (RNS-STK-15/18) | Solo historial (D5) |
| M2 | Datos fiscales en la venta | `VENTA` tiene `numero_comprobante`, `tipo_comprobante`, `metodo_pago`, `canal_pago` | Pasan a `COMPROBANTE` y a las asociaciones con `MEDIO_PAGO` y `CANAL_VENTA` (RNS-VENTA-04 «Antes:») | Quitar de `VENTA` |
| M3 | Estados de la venta | COMPLETADA, CANCELADA, DEVOLUCION | 6 estados con transiciones (RNS-VENTA-05) | Usar las reglas |
| M4 | Roles | 4 roles y `permisos` como JSON | 6 roles (RNS-ROL-01) | 6 roles; permisos en código según la matriz |
| M5 | Atributos duplicados | `PRODUCTO.codigo_interno`, `PRODUCTO_VARIANTE.es_principal`, `CUOTA.fecha_pago` (Date y Timestamp), `PEDIDO.nombre_destinatario`; atributos sin nombre (`Attribute1`, `Attribute2`) | — | Eliminar duplicados y atributos sin nombre |
| M6 | Atributo genérico de variante | `atributo_1_nombre` junto a `color`, `material`, `tamaño` | Solo Tamaño, Color y Material (RNS-STK-07) | Quitar `atributo_1_nombre` |
| M7 | Asociaciones duplicadas | `PRODUCTO`–`PRODUCTO_VARIANTE` (composición y simple); `VENTA`–`CANAL_VENTA` dos veces; cliente de la venta por `CLIENTE_MINORISTA`, `USUARIO` y `CLIENTE_MAYORISTA` | RNS-VENTA-06 | Una asociación por relación |
| M8 | Herencia | `BaseEntity` y `OBJETO_AUDITORIA` sin generalizaciones | RNS-AUD-02/06 indican herencia | Toda entidad extiende `BaseEntity`; auditoría fuera de esta entrega |
| M9 | Stock derivado | `cantidad_reservada` y `cantidad_pendiente` como atributos | Derivados, no se almacenan (RNS-MOV-07) | Calcular en consultas |
| M10 | Usuario del movimiento | `usuario_registro` (String) y asociación con `USUARIO` | Asociación con el usuario (RNS-MOV-04) | Solo la asociación |
| M11 | Estados de otras entidades | `CLIENTE_MAYORISTA` con SUSPENDIDO almacenado; `COMPROMISO_PAGO` VIGENTE; `ORDEN_COMPRA` CONFIRMADA; `RECEPCIÓN_MERCADERÍA` CONFORME / NO_CONFORME / PARCIAL; `DEVOLUCIÓN` con 4 estados | RNS-CLI-05, RNS-CPG-06, RNS-OC-08, RNS-REC-02, RNS-DEV-06 | Usar las reglas cuando se construyan |
| M12 | Clases faltantes o sobrantes | No existen Marca, Lista de precio mayorista ni Línea de devolución; existe `PAGO_CLIENTE`, que las reglas no mencionan | CUU9.1, cálculo de PF, RNS-DEV-01 | Decidir al abordar cada módulo |
| M13 | Significado de `es_automatizado` | «¿Genera pedido automático?» | Ventas que ingresan por integración (RNS-CAN-02) | Usar la definición de las reglas |

`PRODUCTO.stock_minimo` («umbral para alerta de reposición») cumple el rol del «punto de pedido» que usa la guía
de diseño para los estados de stock.
