# Plan de desarrollo — Champagne Florentina

Plan de trabajo del equipo (Bruno, Agostino y Leo) para construir el sistema completo: frontend, backend y API de
ciencia de datos. Define el orden de construcción a partir del modelo de dominio, la división de tareas, el flujo
de ramas y las reglas que permiten que cada integrante desarrolle y pruebe su parte sin depender del avance de los
demás.

| Dato | Valor |
|---|---|
| Versión | 3.0 — 14/11/2026 |
| Arquitectura del frontend | [`frontend/docs/arquitectura-frontend.md`](../frontend/docs/arquitectura-frontend.md) |
| Modelo de dominio | `Entrega 3/html-docs-V2` (StarUML, 36 clases, 56 asociaciones) |
| Reglas y casos de uso | Etapa 3 (Google Doc «Proyecto - Entrega 3», versión del 19/10/2026) |
| Alcance | **Modelo de dominio completo, sin integraciones externas, salvo Mercado Pago (al final)** |

---

## Índice

1. [Alcance](#1-alcance)
2. [Principios de trabajo](#2-principios-de-trabajo)
3. [Cómo se evita depender de otro](#3-cómo-se-evita-depender-de-otro)
4. [Clasificación del modelo de dominio](#4-clasificación-del-modelo-de-dominio)
5. [Orden de construcción](#5-orden-de-construcción)
6. [Flujo de ramas e integración](#6-flujo-de-ramas-e-integración)
7. [Archivos compartidos y archivos generados](#7-archivos-compartidos-y-archivos-generados)
8. [Fase 0 · Decisiones previas](#8-fase-0--decisiones-previas)
9. [Fase 1 · Fundaciones y esquema común](#9-fase-1--fundaciones-y-esquema-común)
10. [Fase 2 · Maestros](#10-fase-2--maestros)
11. [Fase 3 · Stock y ventas](#11-fase-3--stock-y-ventas)
12. [Fase 4 · Compras y proveedores](#12-fase-4--compras-y-proveedores)
13. [Fase 5 · Pedidos, tienda online y devoluciones](#13-fase-5--pedidos-tienda-online-y-devoluciones)
14. [Fase 6 · Análisis](#14-fase-6--análisis)
15. [Fase 7 · Mercado Pago y cierre](#15-fase-7--mercado-pago-y-cierre)
16. [Resumen de asignaciones](#16-resumen-de-asignaciones)
17. [Arquitectura mínima del backend](#17-arquitectura-mínima-del-backend)
18. [Definición de terminado](#18-definición-de-terminado)
19. [Diferencias entre el modelo de dominio y las reglas de negocio](#19-diferencias-entre-el-modelo-de-dominio-y-las-reglas-de-negocio)

---

## 1. Alcance

Se construyen las 36 clases del modelo de dominio. Las funciones que en el análisis dependían de un servicio
externo se resuelven dentro del sistema:

| Proceso (Etapa 3) | Tratamiento en esta entrega |
|---|---|
| 1 · Venta en mostrador | Completo. Comprobante emitido por el sistema, sin CAE |
| 2 · Venta en ecommerce propio | Tienda online propia en Angular (rutas públicas). Checkout con Mercado Pago. Notificaciones visibles en la cuenta del cliente, sin correo |
| 3 · Venta por Mercado Libre | **Fuera de alcance**: el proceso completo depende de la API de Mercado Libre. El canal existe como dato |
| 4 · Recepción de mercadería | Remito cargado manualmente con el archivo adjunto, sin OCR |
| 5 · Orden de compra | Orden en PDF descargable, sin envío automático por correo. Presupuesto cargado manualmente. Sugerencia de reposición desde `ds-api` |
| 6 · Cuenta corriente de proveedores | Completo. Alertas de vencimiento dentro del sistema |
| 7 · Clientes mayoristas | Completo, con portal del cliente mayorista |
| 8 · Stock sin rotación | Completo |
| 9 · Catálogo, precios y promociones | Completo |
| 10 · Devoluciones | Completo. Nota de crédito sin CAE. Reintegro por Mercado Pago cuando la venta se cobró por esa vía; en el resto, registro manual |
| 11 · Dashboard y pronóstico | Completo. KPIs en el backend y pronóstico en `ds-api` (servicio propio, no es integración) |
| 12 · Venta por redes sociales | Completo |

Fuera de alcance: integración con Mercado Libre, ARCA, OCR, Andreani, Tiendanube, servicio de correo y chatbot.
El módulo de personal (asistencia y licencias) no figura en el modelo de dominio y tampoco se incluye.

---

## 2. Principios de trabajo

1. **Cortes verticales.** Cada integrante construye sus funcionalidades completas: endpoint, reglas, pantalla y
   tests. Así puede probar lo que hace de punta a punta sin esperar a nadie.
2. **Dueños por dominio.** Cada integrante conserva los mismos dominios en todas las fases.
3. **Esquema común desde el principio.** Las 36 entidades se modelan y migran en la fase 1, antes de dividirse.
4. **Contrato primero.** Antes de programar una funcionalidad que otro va a usar, se publica su interfaz.
5. **Integración frecuente.** Lo terminado entra a `develop` en cuanto cumple la definición de terminado
   (sección 18).
6. **Las reglas de negocio de la Etapa 3 prevalecen** sobre el modelo de dominio cuando se contradicen
   (sección 19).

---

## 3. Cómo se evita depender de otro

La idea del plan es que cada integrante avance en su backend y su frontend, y pruebe cada desarrollo, sin quedar
esperando el avance de otro. Para eso se combinan cinco mecanismos:

| Mecanismo | Qué resuelve | Dónde se detalla |
|---|---|---|
| **Esquema completo en la fase 1** | Las tablas de todos existen desde el inicio: nadie espera a que otro cree una entidad para poder relacionarla | Sección 9 |
| **Datos de prueba de todos los maestros** | Cada uno prueba con categorías, proveedores, productos, clientes y usuarios cargados, aunque sus pantallas todavía no existan | Sección 9 |
| **Interfaces de servicio con implementación simulada** | Si un módulo usa el servicio de otro que todavía no está terminado, trabaja contra la simulación, que respeta la misma interfaz | Sección 17.3 |
| **Cortes verticales en todas las fases** | Nadie construye una pantalla sobre un backend ajeno sin terminar | Secciones 10 a 15 |
| **Registro distribuido y reglas para archivos generados** | Los conflictos de merge quedan acotados a líneas sueltas fáciles de resolver | Sección 7 |

La única espera real ocurre en la fase 1: el esquema común y las bases del backend y del frontend se completan
antes de dividirse. A partir de la fase 2, cada uno desarrolla y prueba lo suyo con independencia.

---

## 4. Clasificación del modelo de dominio

### 4.1 Las 36 clases

La **entidad** de cada clase (con sus atributos, relaciones y migración) se crea en la fase 1 por el integrante
indicado. La **lógica y las pantallas** se construyen en la fase señalada, por el mismo dueño.

| Tipo | Clase | Dominio | Dueño | Lógica y pantallas |
|---|---|---|---|---|
| Base técnica | `BaseEntity` | Transversal | Agostino | Fase 1 |
| Base técnica | `OBJETO_AUDITORIA` | Auditoría | Agostino | Fase 1 (registro) · fase 6 (consulta, Leo) |
| Catálogo fijo | `ROL` | Seguridad | Leo | Fase 1 |
| Maestro | `USUARIO` | Seguridad | Leo | Fases 1 y 2 |
| Maestro | `CATEGORÍA` | Catálogo | Agostino | Fase 2 |
| Maestro | `PROVEEDOR` | Compras | Agostino | Fase 2 |
| Catálogo fijo | `CANAL_VENTA` | Ventas | Agostino | Fase 2 |
| Catálogo fijo | `MEDIO_PAGO` | Ventas | Agostino | Fase 2 |
| Maestro | `PRODUCTO` | Catálogo | Bruno | Fase 2 |
| Historial de maestro | `PRODUCTO_PRECIO` | Catálogo | Bruno | Fase 2 |
| Historial de maestro | `PRODUCTO_COSTO` | Catálogo | Bruno | Fase 2 |
| Maestro débil | `PRODUCTO_VARIANTE` | Catálogo | Bruno | Fase 2 |
| Maestro débil | `VARIANTE_FOTO` | Catálogo | Bruno | Fase 2 |
| Estado derivado | `STOCK_DISPONIBLE` | Stock | Leo | Fase 3 |
| Maestro | `CLIENTE_MAYORISTA` | Clientes | Leo | Fase 2 |
| Maestro | `CLIENTE_MINORISTA` | Clientes | Leo | Fase 2 (consulta) · fase 5 (alta desde la tienda, Bruno) |
| Maestro | `DESCUENTO` | Catálogo | Leo | Fase 2 |
| Paramétrica | `POLITICA_DEVOLUCION` | Devoluciones | Leo | Fase 2 |
| Transaccional | `MOVIMIENTO_STOCK` | Stock | Leo | Fase 3 |
| Transaccional | `VENTA` | Ventas | Agostino | Fase 3 |
| Transaccional débil | `LINEA_VENTA` | Ventas | Agostino | Fase 3 |
| Transaccional | `CUOTA` | Ventas | Agostino | Fase 3 |
| Transaccional | `COMPROBANTE` | Ventas | Agostino | Fase 3 |
| Transaccional | `PAGO_CLIENTE` | Ventas | Leo | Fase 3 (ver D19) |
| Transaccional | `ORDEN_COMPRA` | Compras | Agostino | Fase 4 |
| Transaccional débil | `LINEA_ORDEN_COMPRA` | Compras | Agostino | Fase 4 |
| Transaccional | `RECEPCIÓN_MERCADERÍA` | Compras | Leo | Fase 4 |
| Transaccional débil | `LINEA_RECEPCIÓN` | Compras | Leo | Fase 4 |
| Transaccional | `DOCUMENTO_DIGITALIZADO` | Compras | Leo | Fase 4 |
| Transaccional | `COMPROMISO_PAGO` | Proveedores | Bruno | Fase 4 |
| Transaccional | `PAGO_PROVEEDOR` | Proveedores | Bruno | Fase 4 |
| Derivada | `CUENTA_CORRIENTE_PROVEEDOR` | Proveedores | Bruno | Fase 4 |
| Transaccional | `PEDIDO` | Envíos | Leo | Fase 5 |
| Transaccional débil | `BULTO` | Envíos | Leo | Fase 5 |
| Transaccional | `DEVOLUCIÓN` | Devoluciones | Agostino | Fase 5 |
| Transaccional | `EVALUACION` | Devoluciones | Agostino | Fase 5 |

Reparto de entidades en la fase 1: Agostino 14, Leo 14, Bruno 8 (Bruno también construye la base del frontend).

Funcionalidades sin clase propia en el modelo: tienda online, dashboard ejecutivo, pronóstico de demanda,
sugerencia de reposición, detección de stock sin rotación y reportes.

### 4.2 Dependencias entre clases

```
ROL ──► USUARIO ─────────────────────────────────────────────┬──► CLIENTE_MAYORISTA
                                                             └──► CLIENTE_MINORISTA
CATEGORÍA ──┬──► PRODUCTO ──► PRECIO / COSTO
PROVEEDOR ──┘       │
                    ▼
             PRODUCTO_VARIANTE ──► VARIANTE_FOTO
                    │
                    ├──► STOCK_DISPONIBLE ◄── MOVIMIENTO_STOCK
                    │                               ▲
CANAL_VENTA ────────┼──► VENTA ──► LINEA_VENTA ─────┤
MEDIO_PAGO ─────────┤      ├──► CUOTA ──► PAGO_CLIENTE
DESCUENTO ──────────┘      ├──► COMPROBANTE
                           ├──► PEDIDO ──► BULTO
                           └──► (LINEA_VENTA) ──► DEVOLUCIÓN ──► EVALUACION
                                                      ▲
POLITICA_DEVOLUCION ──────────────────────────────────┘

PROVEEDOR ──► ORDEN_COMPRA ──► LINEA_ORDEN_COMPRA
                  ├──► RECEPCIÓN ──► LINEA_RECEPCIÓN ──► MOVIMIENTO_STOCK
                  ├──► DOCUMENTO_DIGITALIZADO
                  └──► COMPROMISO_PAGO ──► PAGO_PROVEEDOR ──► CUENTA_CORRIENTE_PROVEEDOR
```

Estas dependencias existen en el esquema desde la fase 1. En la lógica, las que cruzan dominios de distintos
integrantes se cubren con interfaces y simulaciones (sección 17.3).

---

## 5. Orden de construcción

| Fase | Contenido | Condición de salida |
|---|---|---|
| 0 | Decisiones previas | Decisiones de la sección 8 registradas |
| 1 | Fundaciones y esquema común | Login de punta a punta; las 36 entidades migradas; datos de prueba de todos los maestros; interfaces de servicio publicadas |
| 2 | Maestros | Todos los maestros con ABM |
| 3 | Stock y ventas | Mostrador, redes sociales y venta mayorista con stock, cuotas y comprobante |
| 4 | Compras y proveedores | Orden de compra → recepción → compromiso → pago, con cuenta corriente |
| 5 | Pedidos, tienda online y devoluciones | Compra en la tienda con pedido despachado; devolución con nota de crédito |
| 6 | Análisis | Dashboard, pronóstico, sugerencia de reposición, sin rotación y auditoría |
| 7 | Mercado Pago y cierre | Cobro y reintegro con Mercado Pago; pruebas e2e; entrega |

Los plazos de cada fase los define el equipo.

---

## 6. Flujo de ramas e integración

### 6.1 Ramas

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

### 6.2 Reglas

1. **Sincronizar todos los días:** antes de empezar, cada uno trae `develop` a su rama.
2. **Integrar cada tarea terminada** mediante pull request a `develop`, sin acumular el trabajo de una fase entera
   para mergearlo de golpe.
3. **Revisión cruzada:** cada pull request lo aprueba otro integrante antes del merge.
4. **`develop` nunca queda roto:** si un merge rompe el build, se corrige o se revierte en el momento.
5. **Commits** según `CLAUDE.md`: Conventional Commits en una línea, con el módulo como ámbito
   (`feat(compras): emitir orden de compra en pdf`).
6. **Cambios en entidades ajenas:** si alguien necesita modificar una entidad de otro dueño, lo acuerda con él y
   el cambio lo hace el dueño (o se aprueba en un pull request propio y chico).
7. Nadie pushea a `main` sin acuerdo del equipo.

---

## 7. Archivos compartidos y archivos generados

### 7.1 Registro distribuido

Ningún módulo se registra en una lista central que todos editen. Cada uno se declara en su propia carpeta y el
archivo compartido solo tiene una línea por módulo:

| Capa | Cada módulo declara | Archivo compartido |
|---|---|---|
| Frontend | `<feature>.feature.ts`: rutas, ítems de menú y permisos por rol (arquitectura, sección 5.4) | `app.features.ts` |
| Backend | `<modulo>.module.ts`: router, ruta base y permisos | `modules/index.ts` |
| Seeds | `seeders/<modulo>.seeder.ts` | `seeders/DatabaseSeeder.ts` |
| Errores | Códigos del módulo en `<modulo>.errors.ts` | Ninguno (el catálogo los reúne) |

Un conflicto en esos archivos compartidos se resuelve conservando las líneas de ambos.

### 7.2 Archivos generados

Los archivos generados **nunca se resuelven a mano** en un conflicto:

| Archivo | Resolución ante un conflicto |
|---|---|
| Tipos generados desde OpenAPI (`frontend/src/app/core/http/generated/`) | Aceptar cualquiera de las dos versiones y regenerar con el script del frontend |
| Migraciones de MikroORM y su snapshot | Descartar la migración propia, sincronizar con `develop` y volver a generarla |
| `package-lock.json` | Aceptar la versión de `develop` y ejecutar `npm install` para incorporar las dependencias propias |

### 7.3 Componentes compartidos de interfaz

Los componentes de `shared/ui` los crea Bruno en la fase 1. Si alguien necesita uno nuevo o un cambio en uno
existente, lo propone en un pull request chico y separado de su feature, para que el resto lo reciba rápido.

---

## 8. Fase 0 · Decisiones previas

| # | Decisión | Propuesta |
|---|---|---|
| D1 | Fuente de verdad ante contradicciones | Prevalecen las reglas de la Etapa 3; el modelo se actualiza (sección 19) |
| D2 | Roles y permisos | 6 roles de RNS-ROL-01; matriz de permisos de la arquitectura, sección 5.6 |
| D3 | Medios de pago | Los 3 de RNS-MPG-01 (efectivo, débito, crédito); débito y crédito se procesan con Mercado Pago en la fase 7 |
| D4 | Producto: código y marca | `codigo_interno` en el producto, SKU por variante; sin entidad Marca |
| D5 | Precio del producto | Solo historial (`PRODUCTO_PRECIO` / `PRODUCTO_COSTO`) |
| D6 | Comprobantes sin ARCA | TICKET (X), FACTURA A/B y notas sin CAE, con numeración propia por punto de venta |
| D7 | Carga inicial de stock | Movimiento `AJUSTE_INVENTARIO` con motivo «Carga inicial» |
| D8 | Contrato de error | Formato `ApiError` de la arquitectura (sección 5.7) |
| D9 | Esquema de la base | Migraciones de MikroORM; se elimina `schema.update` del arranque |
| D10 | Tienda online | Propia, en la misma aplicación Angular, con rutas públicas (`/tienda`). Tiendanube queda descartado por ser una integración |
| D11 | Notificaciones | Sin correo: avisos en la cuenta del cliente y alertas internas para empleados |
| D12 | Documentos sin OCR | `DOCUMENTO_DIGITALIZADO` guarda el archivo y los datos cargados a mano; `confianza_ocr_porcentaje` queda vacío y `verificado` en verdadero |
| D13 | Cotización de envío sin Andreani | Tarifa configurable por rango de peso y provincia; el código de seguimiento se carga a mano |
| D14 | Orden de compra sin correo | PDF descargable; el envío al proveedor se registra manualmente |
| D15 | Reserva de stock en el checkout | Plazo de reserva configurable (riesgo R08) |
| D16 | Lista de precios mayorista | El modelo no la tiene; propuesta: `descuento_volumen` del cliente más precios específicos por venta (RNS-VENTA-09) |
| D17 | Pronóstico de demanda | `ds-api` con base analítica propia; se habilita por producto según el historial mínimo (RN15) |
| D18 | Tasa de interés por mora por defecto | Parámetro del sistema, editable por el gerente |
| D19 | `PAGO_CLIENTE` | Registra cada cobro de una cuota; necesario para cobros parciales de mayoristas (CUU7.5) |
| D20 | Promociones superpuestas | Se aplica la de mayor beneficio (RNS-DESC-07), en lugar de prohibir la superposición (RN13) |
| D21 | Ubicación en depósito (CUU1.1) | Decidir si se agrega como atributo de la variante |
| D22 | Ventas de Mercado Libre | El canal existe como seed, sin pantallas ni ventas en esta entrega |

Las decisiones que modifican atributos o relaciones (D4, D5, D12, D16, D19, D21 y la sección 19) deben estar
cerradas antes de la fase 1, porque el esquema común se construye a partir de ellas.

---

## 9. Fase 1 · Fundaciones y esquema común

### 9.1 Bases (en paralelo)

**Bruno · Base del frontend**

- Aliases, ESLint con `angular-eslint` y `eslint-plugin-boundaries`.
- Tokens de color y tipografía desde el prototipo; fuentes con `@fontsource`.
- `proxy.conf.json` y ajuste de `nginx.conf` para `/api` y `/ds-api`.
- `core/http`: interceptors, `ApiError`, catálogo de errores, `applyServerErrors`.
- Registro distribuido de features (`FeatureDef`, `app.features.ts`, navegación y permisos).
- `layout/`: shell interno, barra lateral, barra superior, migas, encabezado de página y shell público de la
  tienda.
- `shared/ui`: `button`, `field`, `estado`, `tag`, `panel`, `aviso`, `skeleton`, `empty-state`,
  `confirm-dialog`, `data-table`, `icon`, `kpi-ledger`.
- `shared/data-access`: `crudApi` y `PageQuery`. Pipes `ars`, `numero`, `fecha`.

**Agostino · Base del backend y de `ds-api`**

- Limpieza de `package.json` (hoy lista dependencias transitivas de Express como directas).
- Estructura por módulos con registro distribuido (sección 17), `BaseEntity` con fechas automáticas.
- Registro de auditoría con un subscriber de MikroORM sobre las entidades de RNS-AUD-02.
- Middleware de errores con `ApiError`, validación con Zod, paginación y filtros comunes.
- OpenAPI generado desde los esquemas; script del frontend para generar los tipos.
- Configuración de migraciones y seeds; parámetros del sistema.
- `ds-api`: estructura de módulos, conexión de solo lectura a la base transaccional y base analítica propia.
- Tests de integración con base de datos de prueba.

**Leo · Seguridad de punta a punta**

- Backend: login con JWT en cookie httpOnly, `/auth/me`, cierre de sesión, middleware de autenticación y de
  permisos, `ultimo_acceso` (RNS-USU-01).
- Acceso del cliente minorista solo con correo (RNS-USU-02) y del mayorista con contraseña.
- Frontend: login de empleados y de clientes, `AuthStore`, `authGuard`, `permissionGuard`, directiva `*can`.

`BaseEntity` y la estructura de módulos se mergean primero, porque son la base de las entidades de todos.

### 9.2 Esquema común

1. Cada integrante escribe las entidades de su columna de la sección 4.1, con atributos y relaciones según el
   modelo de dominio corregido por las decisiones de la fase 0.
2. Las tres partes se mergean a `develop`. Las relaciones entre entidades de distintos dueños se revisan en
   conjunto en ese merge.
3. Agostino genera **una única migración inicial** a partir de todas las entidades.
4. Cada integrante escribe los seeds de sus maestros con datos de prueba realistas (por ejemplo, el árbol de
   categorías del bazar, 20 productos con variantes y fotos, proveedores, clientes mayoristas y un usuario por
   rol) y los catálogos fijos (roles, canales, medios de pago).

### 9.3 Interfaces de servicio

Cada dueño publica las interfaces de los servicios que otros módulos van a consumir, con su implementación simulada
(sección 17.3).

**Salida de la fase:** un usuario de cada rol inicia sesión y ve su menú; la base tiene las 36 tablas con datos de
prueba; las interfaces de la sección 17.3 están publicadas con su simulación.

---

## 10. Fase 2 · Maestros

Cada integrante construye backend y pantallas de sus maestros. Como las entidades y los datos de prueba ya existen,
ninguno espera a otro.

### Agostino — Categorías, proveedores y parámetros de venta

| Entidad | Alcance | Reglas |
|---|---|---|
| `CATEGORÍA` | Árbol con alta, edición, movimiento y baja; sin ciclos | RNS-CAT-02 a 14 |
| `PROVEEDOR` | ABM con CUIT único, monto mínimo, plazo de entrega, estado | RNS-OC-09 |
| `CANAL_VENTA`, `MEDIO_PAGO` | Edición de comisiones (gerente) | RNS-CAN, RNS-MPG |

### Bruno — Productos y variantes

| Entidad | Alcance | Reglas |
|---|---|---|
| `PRODUCTO` | ABM, categoría hoja, uno o más proveedores, `codigo_interno` único, `stock_minimo`, peso | CUU9.1, RNS-CAT-06, RNS-OC-10, RNS-STK-17 |
| `PRODUCTO_PRECIO` / `PRODUCTO_COSTO` | Alta con vigencia, vigente e historial | CUU9.2, RNS-STK-15/16/18 |
| `PRODUCTO_VARIANTE` | Atributos, SKU generado, variante principal, medidas, alta de su `STOCK_DISPONIBLE` en 0 | CUU9.4, RNS-STK-01/02/07 a 14 |
| `VARIANTE_FOTO` | Subida, orden y foto obligatoria en la principal | RNS-STK-03 a 06 |

### Leo — Usuarios, clientes, descuentos y política de devolución

| Entidad | Alcance | Reglas |
|---|---|---|
| `USUARIO` | ABM de empleados y asignación de rol | RNS-USU-03, RNS-ROL-01/02 |
| `CLIENTE_MAYORISTA` | ABM con límite de crédito, plazo de pago, descuento por volumen, estado; usuario asociado | CUU7.1, RNS-CLI-03 a 07 |
| `CLIENTE_MINORISTA` | Consulta y edición (el alta ocurre al comprar en la tienda, fase 5) | RNS-CLI-01/06/08 |
| `DESCUENTO` | ABM con tipo, alcance, vigencia, cantidad mínima y cancelación | CUU9.3, RNS-DESC-01 a 07 |
| `POLITICA_DEVOLUCION` | Plazos por motivo | RNS-DEV-07 |

**Salida:** todos los maestros se administran desde la interfaz.

---

## 11. Fase 3 · Stock y ventas

| Responsable | Alcance (backend y frontend) | Casos de uso y reglas | Usa interfaces de |
|---|---|---|---|
| Leo | Stock: `MOVIMIENTO_STOCK` inmutable con bloqueo de fila, servicio de stock, consulta con detalle y movimientos, ajuste manual | CUU1.1, CUU9.5, RNS-MOV-01 a 09, R08 | — |
| Agostino | Núcleo de ventas: servicio de registro y cancelación (`VENTA`, `LINEA_VENTA`, `CUOTA`, `COMPROBANTE`), máquina de estados, aplicación de descuentos, reversión de stock; historial de ventas con detalle y cancelación | CUU1.3, RNS-VENTA, RNS-CUO-01 a 07, RNS-CMP, RNS-VMO | Stock, Pedidos |
| Bruno | Mostrador y redes sociales: endpoints propios de cada canal y sus pantallas (POS de la guía 10.2 y registro manual con opción de envío) | CUU1.1, CUU1.2, CUU12.1 | Ventas, Stock |
| Leo | Ventas mayoristas: endpoint y pantallas de venta con precios específicos, validación de crédito y suspensión, cuotas pactadas; cobro de cuotas con `PAGO_CLIENTE` | CUU7.2, CUU7.4, CUU7.5, RNS-VENTA-09, RNS-CUO-08 | Ventas, Stock |

Bruno y Leo construyen sus canales contra la interfaz del servicio de ventas desde el primer día. Agostino trabaja
contra las simulaciones de stock y pedidos hasta que estén terminados.

**Salida:** ventas de mostrador, redes sociales y mayoristas descuentan stock, generan cuotas y comprobante, y se
pueden cancelar.

---

## 12. Fase 4 · Compras y proveedores

| Responsable | Alcance (backend y frontend) | Casos de uso y reglas | Usa interfaces de |
|---|---|---|---|
| Agostino | `ORDEN_COMPRA` y líneas: borrador, emisión con validaciones, PDF correlativo, cierre con faltante, cancelación; sugerencia inicial por `stock_minimo` | CUU5.1, CUU5.2, RNS-OC-01 a 10 | — |
| Leo | `RECEPCIÓN_MERCADERÍA` y líneas: carga manual del remito con `DOCUMENTO_DIGITALIZADO`, control contra la orden, estados del producto, confirmación con ingreso a stock, resolución de incidencias | CUU4.1 a 4.4, RNS-REC-01 a 08 | Órdenes de compra, Stock |
| Bruno | `COMPROMISO_PAGO`, `PAGO_PROVEEDOR` y cuenta corriente: registro desde la factura, pagos parciales, interés por mora, alertas de vencimiento, calendario | CUU5.3, CUU6.1 a 6.3, RNS-CPG-01 a 07, RNS-CCP-01 | Órdenes de compra |

Las órdenes de compra de prueba (en distintos estados) se agregan a los seeds al inicio de la fase, para que
recepción y compromisos se prueben sin esperar las pantallas de órdenes.

**Salida:** una orden de compra se emite, se recibe (total o parcial), genera su compromiso de pago y se salda.

---

## 13. Fase 5 · Pedidos, tienda online y devoluciones

| Responsable | Alcance (backend y frontend) | Casos de uso y reglas | Usa interfaces de |
|---|---|---|---|
| Bruno | Tienda online (`/tienda`): catálogo con stock, ficha de producto, carrito con reserva temporal, datos de envío con cotización (D13), checkout con el procesador de pago simulado, alta automática del cliente minorista, cuenta del cliente con pedidos y solicitud de devolución | CUU2.1, CUU2.3 (sin correo), RNS-CLI-01, RNS-ENV-10, guía 12 | Ventas, Stock, Pedidos, Pagos, Devoluciones |
| Leo | `PEDIDO` y `BULTO`: cola de preparación de todos los canales, precarga de bultos, preparación, despacho con seguimiento manual, entrega, no entregado y reintento, cancelación; portal del cliente mayorista con su cuenta corriente | CUU2.2, CUU7.3, RNS-ENV-01 a 17 | Stock |
| Agostino | `DEVOLUCIÓN` y `EVALUACION`: solicitud con validación de plazos, evaluación, recepción y verificación, reingreso a stock, nota de crédito, reintegro manual | CUU10.1 a 10.4, RNS-DEV-01 a 11, RNS-EVAL-01 a 05 | Stock, Pagos |

**Salida:** un cliente compra en la tienda, el pedido se prepara y se entrega, y la devolución genera su nota de
crédito.

---

## 14. Fase 6 · Análisis

| Responsable | Alcance | Casos de uso y reglas |
|---|---|---|
| Agostino | `ds-api`: carga periódica a la base analítica (esquema de constelación de la Etapa 3), pronóstico por producto con nivel de confianza, sugerencia de reposición conectada a la orden de compra | CUU5.1, CUU11.2, RN06, RN15 |
| Leo | Dashboard ejecutivo (panel del día, guía 10.1) con KPIs del backend; consulta de auditoría | CUU11.1, RNS-AUD |
| Bruno | Stock sin rotación con valor inmovilizado y promoción de liquidación; pantalla de pronóstico (guía 11); reportes de los requerimientos de análisis de la Etapa 3; exportación (guía 13) | CUU8.1, CUU8.2 |

La pantalla de pronóstico de Bruno se construye contra el contrato de `ds-api` publicado por Agostino al inicio de
la fase, con respuestas simuladas hasta que el modelo esté listo.

**Salida:** el gerente consulta indicadores, pronósticos y sugerencias, y liquida stock sin rotación.

---

## 15. Fase 7 · Mercado Pago y cierre

| Responsable | Alcance |
|---|---|
| Agostino | Mercado Pago de punta a punta: implementación real del procesador de pago (creación del cobro, webhook de confirmación, transición PENDIENTE → COMPLETADA, reintegros) y componentes de pago del frontend que usan el POS y la tienda. Como ambos ya funcionan con el procesador simulado, el cambio no requiere tocar sus pantallas |
| Bruno | Pruebas e2e de la tienda y del mostrador; revisión de todas las pantallas contra el checklist de la guía 17 |
| Leo | Pruebas e2e del resto de los flujos, datos de demostración y documentación de instalación |
| Todo el equipo | Merge a `main` |

---

## 16. Resumen de asignaciones

| Fase | Bruno | Agostino | Leo |
|---|---|---|---|
| 1 · Fundaciones | Base del frontend y `shared/ui`; 8 entidades | Base del backend, auditoría, `ds-api`; 14 entidades; migración inicial | Seguridad completa; 14 entidades |
| 2 · Maestros | Productos, precios, variantes, fotos | Categorías, proveedores, canales y medios de pago | Usuarios, clientes, descuentos, política de devolución |
| 3 · Stock y ventas | Mostrador y redes sociales | Núcleo de ventas e historial | Stock; ventas mayoristas y cobros |
| 4 · Compras | Compromisos, pagos, cuenta corriente | Órdenes de compra | Recepción de mercadería |
| 5 · Pedidos y tienda | Tienda online y cuenta del cliente | Devoluciones y evaluación | Pedidos y bultos; portal mayorista |
| 6 · Análisis | Sin rotación, pronóstico (pantalla), reportes | `ds-api`: pronóstico y sugerencias | Dashboard y auditoría |
| 7 · Cierre | e2e de tienda y mostrador; revisión de la guía | Mercado Pago de punta a punta | e2e del resto, demo e instalación |

**Dominios de cada integrante:**

- **Bruno:** catálogo, canales de venta presenciales y online, finanzas de proveedores, reportes.
- **Agostino:** base del backend, núcleo de ventas, compras, devoluciones, pagos, `ds-api`.
- **Leo:** seguridad, clientes, stock, recepción, logística de pedidos, dashboard.

La asignación puede cambiarse por acuerdo del equipo sin alterar el orden de las fases.

---

## 17. Arquitectura mínima del backend

Lo necesario para trabajar en paralelo. Si crece, se pasa a `backend/docs/`.

### 17.1 Estructura

```
backend/src/
├─ index.ts
├─ config/                      variables de entorno validadas, parámetros del sistema
├─ shared/
│  ├─ db/                       BaseEntity, subscriber de auditoría, configuración de MikroORM
│  ├─ http/                     error-handler, ApiError, paginación, validación con Zod
│  ├─ auth/                     authenticate, requirePermission(permiso)
│  ├─ pdf/                      generación de comprobantes y órdenes de compra
│  ├─ archivos/                 almacenamiento de fotos y documentos
│  └─ openapi/                  registro de esquemas y publicación en /api/docs
├─ modules/
│  ├─ index.ts                  lista de módulos (una línea por módulo)
│  ├─ auth/  usuarios/  clientes/
│  ├─ categorias/  productos/  descuentos/
│  ├─ stock/  ventas/  pagos/
│  ├─ proveedores/  compras/  recepciones/  cuentas-proveedor/
│  ├─ pedidos/  devoluciones/
│  ├─ tienda/                   endpoints públicos de catálogo y checkout
│  └─ dashboard/  auditoria/
├─ migrations/
└─ seeders/
```

Cada módulo contiene:

```
modules/<modulo>/
├─ <modulo>.module.ts           registro: router, ruta base, permisos
├─ <entidad>.entity.ts          entidades de MikroORM (creadas en la fase 1)
├─ <modulo>.schemas.ts          esquemas Zod de entrada y salida (generan OpenAPI)
├─ <modulo>.service.ts          implementación real de las reglas y transacciones
├─ <modulo>.contract.ts         interfaz pública del servicio, si otros módulos lo usan
├─ <modulo>.fake.ts             implementación simulada de esa interfaz
├─ <modulo>.errors.ts           códigos de error del módulo
├─ <modulo>.controller.ts       traducción HTTP ↔ servicio, sin lógica de negocio
└─ <modulo>.routes.ts           rutas con requirePermission
```

### 17.2 Reglas

- Las reglas de negocio viven en los servicios; los controladores no acceden al ORM.
- Un módulo usa a otro **solo a través de su interfaz** (`<modulo>.contract.ts`), nunca importando su servicio
  ni sus entidades para escribir en ellas.
- Toda operación sobre stock usa transacción y bloqueo de fila (riesgo R08).
- Errores con `ApiError`; listados con `{ datos, total }`; rutas en español y en plural.
- `ds-api` solo lee de la base transaccional; nunca escribe en ella.

### 17.3 Interfaces entre módulos y simulaciones

Cuando un módulo necesita el servicio de otro que todavía no está terminado, trabaja contra su implementación
simulada. La simulación respeta la interfaz, devuelve resultados coherentes con los datos de prueba y registra lo
que se le pidió, para poder verificarlo en los tests. Al mergearse la implementación real, se cambia el proveedor
de la interfaz en un solo lugar y los consumidores no se modifican.

| Interfaz | Dueño | Operaciones principales | La usan |
|---|---|---|---|
| `StockService` | Leo | Inicializar el stock de una variante, consultar disponibilidad, registrar movimiento, reservar y liberar | Productos, ventas, mostrador, mayoristas, recepciones, pedidos, devoluciones, tienda |
| `VentasService` | Agostino | Registrar venta, cancelar venta, consultar venta | Mostrador, redes sociales, mayoristas, tienda, devoluciones |
| `PedidosService` | Leo | Crear pedido desde una venta, cancelar pedido | Ventas, tienda |
| `ComprobantesService` | Agostino | Emitir comprobante, emitir nota de crédito | Ventas, devoluciones |
| `OrdenesCompraService` | Agostino | Consultar orden y saldo por línea, registrar unidades recibidas, cerrar orden | Recepciones, compromisos de pago |
| `ProcesadorPago` | Agostino | Crear cobro, consultar estado, reintegrar | Mostrador, tienda, devoluciones |
| API de `ds-api` | Agostino | Pronóstico por producto, sugerencias de reposición | Órdenes de compra, pantalla de pronóstico |

Las interfaces se publican en la fase 1 o al comienzo de la fase en que se necesitan, siempre en un pull request
chico que contiene solo la interfaz y su simulación.

---

## 18. Definición de terminado

- [ ] Contrato publicado en OpenAPI y tipos del frontend regenerados.
- [ ] Reglas de negocio aplicadas en el backend y citadas por su código (RNS-, CUU) en el código o en los tests.
- [ ] Tests del backend para el camino principal y los caminos alternativos del caso de uso.
- [ ] Si el módulo expone una interfaz, su simulación sigue cumpliendo los mismos tests de contrato.
- [ ] Pantalla según la arquitectura del frontend y el checklist de la guía 17.
- [ ] Estados de carga, vacío y error con «Reintentar».
- [ ] Permisos aplicados en backend y frontend.
- [ ] Textos revisados con las reglas de `CLAUDE.md`.
- [ ] Lint y build sin errores; pull request aprobado por otro integrante.

---

## 19. Diferencias entre el modelo de dominio y las reglas de negocio

El modelo de StarUML (09/10/2026) es anterior a las reglas de la Etapa 3 (19/10/2026). Diferencias encontradas al
analizar las 36 clases y 56 asociaciones. Se resuelven en la fase 0, antes de construir el esquema común:

| # | Diferencia | Modelo | Reglas | Resolución propuesta |
|---|---|---|---|---|
| M1 | Precio y costo del producto | `precio_costo_base` y `precio_venta_publico` en `PRODUCTO` | Historial (RNS-STK-15/18) | Solo historial (D5) |
| M2 | Datos fiscales en la venta | `numero_comprobante`, `tipo_comprobante`, `metodo_pago`, `canal_pago` en `VENTA` | Pasan a `COMPROBANTE` y a las asociaciones (RNS-VENTA-04) | Quitar de `VENTA` |
| M3 | Estados de la venta | COMPLETADA, CANCELADA, DEVOLUCION | 6 estados con transiciones (RNS-VENTA-05) | Usar las reglas |
| M4 | Roles | 4 roles y `permisos` como JSON | 6 roles (RNS-ROL-01) | 6 roles; permisos en código |
| M5 | Atributos duplicados o sin nombre | `PRODUCTO.codigo_interno`, `PRODUCTO_VARIANTE.es_principal`, `CUOTA.fecha_pago`, `PEDIDO.nombre_destinatario`; `Attribute1`, `Attribute2` | — | Eliminar |
| M6 | Atributo genérico de variante | `atributo_1_nombre` | Solo Tamaño, Color y Material (RNS-STK-07) | Quitar |
| M7 | Asociaciones duplicadas | `PRODUCTO`–`PRODUCTO_VARIANTE` dos veces; `VENTA`–`CANAL_VENTA` dos veces; cliente de la venta por tres caminos | RNS-VENTA-06 | Una asociación por relación |
| M8 | Herencia | `BaseEntity` y `OBJETO_AUDITORIA` sin generalizaciones | RNS-AUD-02/06 | Toda entidad extiende `BaseEntity`; las de RNS-AUD-02 registran auditoría |
| M9 | Stock derivado | `cantidad_reservada` y `cantidad_pendiente` almacenados | Derivados (RNS-MOV-07) | Calcular en consultas |
| M10 | Usuario del movimiento | `usuario_registro` (String) y asociación con `USUARIO` | RNS-MOV-04 | Solo la asociación |
| M11 | Estados de clientes y compras | `CLIENTE_MAYORISTA` con SUSPENDIDO almacenado; `COMPROMISO_PAGO` VIGENTE; `ORDEN_COMPRA` CONFIRMADA; `RECEPCIÓN` CONFORME / NO_CONFORME / PARCIAL | RNS-CLI-05, RNS-CPG-06, RNS-OC-08, RNS-REC-02 | Usar las reglas |
| M12 | Estados y estructura de la devolución | 4 estados; `id_venta_original`, `tipo_devolucion`; composición `DEVOLUCIÓN`–`DEVOLUCIÓN` | 7 estados; una devolución por línea de venta (RNS-DEV-01/02/06) | Usar las reglas |
| M13 | Clases faltantes | No existen Marca, Lista de precio mayorista ni Línea de devolución | CUU9.1, CUU7.1, RNS-DEV-01 | D4, D16 y M12 |
| M14 | Significado de `es_automatizado` | «¿Genera pedido automático?» | Ventas que ingresan por integración (RNS-CAN-02) | Usar las reglas |
| M15 | Dirección del pedido | `direccion_destino` de tipo `Direccion` sin definir | Dirección estructurada (RNS-ENV-05/06) | Objeto embebido con calle, número, piso, departamento, código postal, localidad y provincia |

`PRODUCTO.stock_minimo` («umbral para alerta de reposición») cumple el rol del «punto de pedido» que usa la guía
de diseño para los estados de stock.
