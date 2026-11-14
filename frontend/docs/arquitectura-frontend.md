# Arquitectura del frontend — Champagne Florentina

Documento de referencia para todo el equipo de desarrollo. Define cómo se construye el frontend Angular del
sistema de gestión: estructura, reglas de dependencia, manejo de datos, seguridad, interfaz y convenciones.

Toda decisión que se aparte de este documento se discute primero y, si se aprueba, se actualiza acá antes de
implementarla.

| Dato | Valor |
|---|---|
| Versión | 1.2 — 14/11/2026 (registro distribuido de features) |
| Framework | Angular 22 (standalone, zoneless, signals) |
| Guía visual obligatoria | `GUIA_DISENO_CHAMPAGNE_FLORENTINA.md` (paleta 06 · Petróleo & Rosa Viejo, tipografía F · Catálogo) |
| Referencia analizada | [AgosUTN/App-web](https://github.com/AgosUTN/App-web) (`Front_V2`, Angular 21) |
| Fuentes funcionales | Entrega 1, Entrega 2 y Etapa 3 del proyecto final |

---

## Índice

1. [Contexto del proyecto](#1-contexto-del-proyecto)
2. [Análisis de la referencia (App-web)](#2-análisis-de-la-referencia-app-web)
3. [Qué se conserva de la referencia](#3-qué-se-conserva-de-la-referencia)
4. [Mejoras incorporadas](#4-mejoras-incorporadas)
5. [Arquitectura propuesta](#5-arquitectura-propuesta)
6. [Features del alcance actual](#6-features-del-alcance-actual)
7. [Plantilla de una feature](#7-plantilla-de-una-feature)
8. [Convenciones](#8-convenciones)
9. [Testing](#9-testing)
10. [Inconsistencias detectadas en la documentación](#10-inconsistencias-detectadas-en-la-documentación)
11. [Referencias](#11-referencias)

---

## 1. Contexto del proyecto

### 1.1 Negocio

Champagne Florentina es un bazar con 30 años de trayectoria, local céntrico, venta por Mercado Libre y redes
sociales, y control de stock en papel. Los problemas que el sistema resuelve (Entrega 1):

- **Stock desactualizado entre canales:** se venden productos que ya no existen o se rechazan ventas con stock.
- **Compras intuitivas:** capital inmovilizado en productos sin rotación y quiebres en productos clave.
- **Vencimientos con proveedores** gestionados a mano, con intereses por mora.
- **Sin datos históricos** para decidir.

### 1.2 Stack

| Capa | Tecnología |
|---|---|
| Frontend ERP | Angular 22 |
| API de negocio | Node.js + Express + MikroORM (`backend/`) |
| API de ciencia de datos | FastAPI (`ds-api/`) |
| Base de datos | MySQL 8.4 |
| Infraestructura | Docker Compose; build de producción del frontend servido por nginx |
| Autenticación | JWT en cookie httpOnly |

### 1.3 Alcance de esta entrega

**El modelo de dominio completo (36 clases), sin integraciones externas**, con una única excepción: **Mercado
Pago, que se incorpora al final**. El detalle por proceso, el orden de construcción y la división del trabajo
están en [`docs/plan-de-desarrollo.md`](../../docs/plan-de-desarrollo.md).

| Módulo | Casos de uso (Etapa 3) |
|---|---|
| Seguridad: usuarios, roles, acceso de empleados y clientes | — |
| Catálogo: categorías, productos, variantes, precios, descuentos | CUU9.1 a 9.5 |
| Stock: consulta, movimientos, ajustes, sin rotación | CUU1.1, CUU9.5, CUU8.1, CUU8.2 |
| Ventas: mostrador, redes sociales, mayoristas, cuotas, comprobantes | CUU1.1 a 1.3, CUU12.1, CUU7.1 a 7.5 |
| Tienda online propia (rutas públicas) y cuenta del cliente | CUU2.1, CUU2.3 |
| Pedidos y envíos | CUU2.2 |
| Compras: órdenes, recepción, compromisos y pagos a proveedores | CUU4.1 a 4.4, CUU5.1 a 5.3, CUU6.1 a 6.3 |
| Devoluciones | CUU10.1 a 10.4 |
| Dashboard, pronóstico de demanda (`ds-api`), auditoría, reportes | CUU11.1, CUU11.2 |
| Cobro y reintegro con Mercado Pago | CUU1.2, CUU2.1, CUU10.3 |

Fuera de alcance: Mercado Libre, ARCA, OCR, Andreani, Tiendanube, servicio de correo y chatbot. Sus funciones se
resuelven dentro del sistema: comprobantes sin CAE, documentos cargados a mano, seguimiento de envíos manual y
avisos visibles en la aplicación en lugar de correos. Las pantallas que muestran comprobantes quedan preparadas
para mostrar el estado de autorización si más adelante se integra ARCA.

### 1.4 Roles

Fuente de verdad: **RNS-ROL-01 de la Etapa 3**.

| Rol | Descripción |
|---|---|
| `GERENTE` | Acceso total, autoriza operaciones especiales, consulta reportes |
| `VENDEDOR` | Registra ventas, modifica precios puntuales, sin acceso a finanzas |
| `OPERARIO_DEPOSITO` | Stock, recepción, movimientos, preparación y despacho de pedidos |
| `ADMINISTRATIVO` | Compras, pagos, documentos, reportes operacionales |
| `CLIENTE_MINORISTA` | Consulta el estado de sus pedidos (fuera del alcance actual) |
| `CLIENTE_MAYORISTA` | Consulta historial, pagos pendientes y crédito (fuera del alcance actual) |

### 1.5 Reglas de negocio que impactan en la interfaz

| Regla | Efecto en el frontend |
|---|---|
| RNS-STK-01/02 | Un producto tiene al menos una variante y exactamente una principal; la primera creada es la principal |
| RNS-STK-03 | La variante principal no se activa sin al menos una foto: el formulario lo indica y bloquea la activación |
| RNS-STK-07/08 | Atributos de variante: solo Tamaño, Color y Material, todos opcionales |
| RNS-STK-11 a 14 | El SKU de la variante lo genera el sistema; se muestra como dato de solo lectura en Red Hat Mono |
| RNS-STK-15/16/18 | Precio y costo se definen por producto, con fecha de vigencia e historial consultable |
| RNS-MOV-02 | El stock nunca es negativo: el ajuste manual valida antes de enviar y muestra el rechazo del backend |
| RNS-MOV-03 | El ajuste manual exige motivo |
| RNS-VENTA-05 | Estados de venta con colores de la guía 1.8; transiciones solo las permitidas |
| RNS-VENTA-07/10/11 | Los totales y precios de una venta registrada son de solo lectura |
| RNS-MPG-01 | Medios de pago: efectivo, débito y crédito (ver inconsistencia 10.2) |

---

## 2. Análisis de la referencia (App-web)

### 2.1 Estructura

```
Front_V2/src/app/
├─ core/        layout (sidenav, toolbar, breadcrumb), guards, interceptors,
│               servicios singleton (auth, caché, socket, menú, viewport), login y páginas de error
├─ shared/      clases base (BaseCrudService, BasePagedComponent), confirm dialog,
│               directivas, validadores, modelos de respuesta, constantes
└─ features/<entidad>/
   ├─ components/  create · read · update · readDialog
   ├─ models/      DTOs por caso de uso (Create, Read, Update, Table, Detail)
   └─ services/    <entidad>-service.ts extends BaseCrudService
```

### 2.2 Flujo de una petición

```
Componente ──► XService extends BaseCrudService<Create, Read, Update, Table>
                 │
                 ▼
            HttpClient ──► CredentialsInterceptor ──► ErrorInterceptor ──► CacheInterceptor ──► API
                                (withCredentials)       (status + code)      (GET paginados)
```

### 2.3 Piezas destacadas

- **`BasePagedComponent`:** paginación, orden y filtro del lado del servidor, con filas esqueleto mientras carga.
- **Metadatos en las rutas:** `data: { breadcrumb, rol, crud }` alimenta las migas, el guard y la caché.
- **Caché HTTP en memoria** invalidada al navegar a otro CRUD y por eventos de socket.io emitidos por la API.
- **DTOs separados por caso de uso** en lugar de un modelo único por entidad.
- **Vista mobile** con tarjetas y **stepper** para el préstamo de varios libros.

---

## 3. Qué se conserva de la referencia

| Práctica | Motivo |
|---|---|
| División `core` / `shared` / `features` | Separa lo global, lo reutilizable y el negocio |
| Servicio CRUD genérico y tipado | Evita repetir las operaciones básicas por entidad |
| DTOs por caso de uso | Cada pantalla recibe solo lo que usa |
| Manejo de errores HTTP en un interceptor | Un único punto para el tratamiento transversal |
| JWT en cookie httpOnly (`withCredentials`) | El token no es accesible desde JavaScript |
| Filas esqueleto durante la carga | Coincide con la guía 7.15 |

---

## 4. Mejoras incorporadas

Cada mejora cita el archivo de App-web que la motiva.

| # | Problema en App-web | Evidencia | Mejora adoptada |
|---|---|---|---|
| 1 | Todas las rutas importan sus componentes de forma directa: un solo paquete y un único archivo de rutas | `app.routes.ts` | Cada feature define `<feature>.routes.ts` y se carga con `loadChildren` |
| 2 | Uso de `cdr.detectChanges()` y `markForCheck()` en casi todos los componentes | `libros-read.ts`, `libros-create.ts`, `prestamos-create.ts` | Estado en `signal` y `computed`; lecturas con `httpResource`. Angular 22 es zoneless por defecto, así que esta mejora es obligatoria |
| 3 | Herencia entre componentes: `LibrosUpdate extends LibrosCreate` redefine el formulario y usa el template del padre | `libros-update.ts`, `basePagedComponent.ts` | Composición: un `form-page` por entidad con modo alta o edición según la ruta; el estado de tabla es una función componible |
| 4 | El guard confía en `localStorage('rol')`, editable por el usuario; parpadeo al vencer el token | `auth.guard.ts`, `auth-service.ts` | `AuthStore` con el usuario en un signal, cargado desde `/api/auth/me` al iniciar; permisos por acción |
| 5 | Roles repetidos en las rutas, en `MenuService` y en `isAdmin()`; íconos como strings de SVG | `menu-service.ts`, `app.routes.ts` | Cada feature declara sus rutas, ítems de menú y permisos en un solo archivo (`<feature>.feature.ts`); `core` los reúne. Sin listas repetidas ni archivos centrales que todos editen |
| 6 | `shared` importa diálogos de las features | `dialog-service.ts` | Reglas de dependencia explícitas y verificadas con ESLint (sección 5.3) |
| 7 | Cada componente repite su `switch (status)` para traducir errores | `libros-create.ts`, `step2-component.ts` | Catálogo único `code → mensaje` y helper `applyServerErrors(form, error)` |
| 8 | Errores 0, 400 y 500 redirigen a `/error/:code` | `error.interceptor.ts` | Aviso dentro del panel afectado con acción «Reintentar» (guía 7.15); página de error solo para rutas inexistentes o sin permiso |
| 9 | El HTML de cada listado está duplicado para escritorio y celular; breakpoint repetido en dos lugares | `libros-read.html`, `viewport-service.ts`, `main-layout-component.ts` | `<app-data-table>` que resuelve ambas vistas; breakpoints con `BreakpointObserver` del CDK expuestos como signal |
| 10 | SVG copiado en cada botón y esqueleto escrito celda por celda | `libros-read.html`, `iconPaths.ts` | Componentes de `shared/ui` y `lucide-angular` |
| 11 | `any` en interceptors, `!` en formularios, interfaces de respuesta duplicadas, constantes copiadas de la API | `cache.interceptor.ts`, `apiResponseGet.model.ts`, `crudNames.config.ts` | `ApiResponse<T>` y `Paginado<T>` únicos, formularios tipados y tipos generados desde el OpenAPI del backend |
| 12 | Paginación con cinco parámetros sueltos; el estado no queda en la URL | `baseCrudService.ts` | Objeto `PageQuery` sincronizado con los query params |
| 13 | Caché global acoplada al router; se borra completa | `cache-service.ts`, `crud-tracking-service.ts` | Sin caché al inicio; cuando haga falta, caché por recurso invalidada por etiqueta |
| 14 | IP fija en el entorno (`192.168.100.8`) y carpeta `enviroments` mal escrita | `enviroment.ts` | URLs relativas `/api` y `/ds-api`, con `proxy.conf.json` en desarrollo y nginx en producción |
| 15 | Tema de Angular Material con Inter y colores escritos en los componentes | `styles.scss`, `_variables.scss` | Tokens de la guía, Archivo y Red Hat Mono, CDK sin tema visual |
| 16 | Archivos de test generados sin contenido | `*.spec.ts` | Estrategia mínima definida (sección 9) |

---

## 5. Arquitectura propuesta

### 5.1 Principios

1. **Standalone, zoneless y signals.** Sin `NgModule`, sin `zone.js`, sin `ChangeDetectorRef`.
2. **Control de flujo nuevo:** `@if`, `@for`, `@switch`. No se importa `CommonModule`.
3. **`ChangeDetectionStrategy.OnPush`** en todos los componentes.
4. **`inject()`** en lugar de inyección por constructor.
5. **Feature-first:** cada módulo de negocio es autocontenido y se carga bajo demanda.
6. **Composición sobre herencia:** no hay clases base de componentes.
7. **Contrato tipado** con el backend.
8. **La guía de diseño es obligatoria:** ningún color, fuente o espaciado fuera de sus tokens.

### 5.2 Estructura de carpetas

```
frontend/src/
├─ styles/
│  ├─ tokens/
│  │  ├─ colors.css            ← bloque [data-paleta="petroleo"] de prototipo-paletas/assets/paletas.css
│  │  └─ typography.css        ← bloque [data-tipo="catalogo"] de prototipo-paletas/assets/tipografias.css
│  ├─ base.css                 ← reset, body, foco, números tabulares
│  └─ layout.css               ← grillas g-2-1, g-3-2, g-1-1 (guía 5.5)
├─ styles.scss                 ← importa fuentes (@fontsource) y styles/
└─ app/
   ├─ app.config.ts
   ├─ app.features.ts          ← lista de features (una línea por feature)
   ├─ app.routes.ts            ← arma las rutas desde app.features.ts, más las rutas de error
   │
   ├─ core/                    ← singletons; sin pantallas de negocio
   │  ├─ auth/                 auth.store.ts · auth.api.ts · auth.guard.ts · permission.guard.ts
   │  │                        roles.ts · permisos.registry.ts · can.directive.ts
   │  ├─ http/                 api-base.interceptor.ts · credentials.interceptor.ts · error.interceptor.ts
   │  │                        api.types.ts · api-error.ts · error-catalog.ts
   │  ├─ navigation/           feature.types.ts · navegacion.ts · breadcrumbs.ts
   │  ├─ formatters/           ars.pipe.ts · porcentaje.pipe.ts · fecha.pipe.ts (es-AR, guía 16.2)
   │  ├─ estados/              estados.ts (estado backend → texto y variante, guía 1.8)
   │  └─ ui-state/             breakpoints.ts · notificaciones.service.ts
   │
   ├─ layout/                  shell interno · sidebar · topbar · breadcrumbs · page-header
   │                           shell público de la tienda
   │
   ├─ shared/
   │  ├─ ui/                   button · estado · tag · panel · kpi-ledger · field · aviso
   │  │                        data-table · skeleton · empty-state · dialog · confirm-dialog
   │  │                        segmented · chip-filter · stepper · detail-panel · meter · icon
   │  ├─ data-access/          crud-api.ts · page-query.ts
   │  └─ forms/                validators/ · server-errors.ts
   │
   └─ features/
      ├─ auth/                 login de empleados y de clientes
      ├─ panel/                panel del día (dashboard ejecutivo)
      ├─ ventas/
      │  ├─ mostrador/         POS
      │  ├─ redes-sociales/    venta manual por redes sociales
      │  ├─ historial/         listado, detalle y cancelación de ventas
      │  ├─ pedidos/           preparación, despacho y entrega
      │  ├─ mayoristas/        clientes mayoristas, ventas, cuotas y cobros
      │  └─ devoluciones/      solicitudes, evaluación y nota de crédito
      ├─ inventario/
      │  ├─ productos/         alta, edición, variantes, precios, fotos
      │  ├─ stock/             consulta, movimientos y ajuste manual
      │  ├─ sin-rotacion/      detección y promoción de liquidación
      │  └─ recepciones/       recepción de mercadería contra la orden de compra
      ├─ compras/
      │  ├─ ordenes/           órdenes de compra y sugerencias de reposición
      │  └─ proveedores/       proveedores, compromisos, pagos y cuenta corriente
      ├─ analisis/
      │  ├─ prediccion/        pronóstico de demanda (ds-api)
      │  └─ reportes/          reportes de los requerimientos de análisis
      ├─ auditoria/            consulta de cambios
      ├─ config/
      │  ├─ usuarios/          usuarios y roles
      │  ├─ categorias/        árbol de categorías
      │  ├─ descuentos/        promociones y descuentos
      │  └─ parametros/        canales, medios de pago, política de devolución, tarifas de envío
      ├─ tienda/               rutas públicas: catálogo, ficha, carrito, checkout
      └─ mi-cuenta/            portal del cliente: pedidos, devoluciones, cuenta corriente (mayoristas)
```

Las rutas siguen el mapa de la guía 6.1. El módulo de personal de la guía no forma parte del modelo de dominio y
no se construye.

Estructura interna de cada feature:

```
features/<feature>/
├─ <feature>.feature.ts       rutas, ítems de menú y permisos de la feature (registro distribuido)
├─ <feature>.routes.ts
├─ data-access/
│  ├─ <feature>.api.ts         llamadas HTTP tipadas
│  ├─ <feature>.store.ts       estado de la feature con signals (solo si hace falta)
│  └─ models/                  DTOs por caso de uso: *-tabla.dto.ts, *-detalle.dto.ts, *-alta.dto.ts…
├─ pages/                      componentes de ruta: leen la URL, usan la API, componen la pantalla
└─ components/                 presentacionales: solo input() y output(), sin servicios
```

### 5.3 Reglas de dependencia

```
                ┌──────────┐
                │ features │──────────────┐
                └────┬─────┘              │
                     │                    ▼
┌────────┐      ┌────▼─────┐        ┌──────────┐
│ layout │─────►│  shared  │◄───────│   core   │
└───┬────┘      └──────────┘        └──────────┘
    └──────────────────────────────────▲
```

| Desde | Puede importar | No puede importar |
|---|---|---|
| `features/a` | `shared`, `core` | `features/b`, `layout` |
| `layout` | `shared`, `core` | `features` |
| `core` | `shared/ui` (solo para notificaciones o diálogos genéricos) | `features`, `layout` |
| `shared` | nada del proyecto, salvo otros archivos de `shared` | `core`, `features`, `layout` |

- Si dos features necesitan lo mismo, se sube a `shared` (si es genérico) o a `core` (si es un singleton).
- Aliases en `tsconfig.json`: `@core/*`, `@shared/*`, `@features/*`, `@layout/*`. No se usan rutas `../../../`.
- Verificación automática con `eslint-plugin-boundaries`; una violación hace fallar el lint.

### 5.4 Registro distribuido de features

Cada feature se describe a sí misma en un único archivo. Así, sumar una feature no obliga a editar listas de rutas,
menú o permisos que el resto del equipo también modifica: el único archivo compartido es `app.features.ts`, con una
línea por feature, y sus conflictos son triviales.

```ts
// core/navigation/feature.types.ts
export interface FeatureDef {
  ruta: string;                                         // segmento base: 'inventario/stock'
  rutas: () => Promise<Routes>;                         // carga diferida (loadChildren)
  nav?: NavItem[];                                      // ítems del menú lateral
  permisos: Partial<Record<Permiso, RolEmpleado[]>>;    // qué roles reciben cada permiso de la feature
  publica?: boolean;                                    // true en la tienda: usa el shell público
}

export interface NavItem {
  ruta: string;
  etiqueta: string;
  icono: LucideIconName;
  grupo: 'Ventas' | 'Inventario' | 'Compras' | 'Análisis' | 'Configuración';
  permiso: Permiso;
  orden: number;
}
```

```ts
// features/inventario/stock/stock.feature.ts
export const stockFeature: FeatureDef = {
  ruta: 'inventario/stock',
  rutas: () => import('./stock.routes').then((m) => m.default),
  nav: [
    { ruta: '/inventario/stock', etiqueta: 'Stock y variantes', icono: 'package', grupo: 'Inventario', permiso: 'stock:leer', orden: 10 },
  ],
  permisos: {
    'stock:leer': ['GERENTE', 'VENDEDOR', 'OPERARIO_DEPOSITO', 'ADMINISTRATIVO'],
    'stock:ajustar': ['GERENTE', 'OPERARIO_DEPOSITO'],
  },
};
```

```ts
// app.features.ts — único archivo compartido: una línea por feature
export const FEATURES: FeatureDef[] = [
  authFeature,
  panelFeature,
  mostradorFeature,
  stockFeature,
  productosFeature,
  // …
];
```

```ts
// app.routes.ts — se arma a partir de FEATURES
export const routes: Routes = [
  ...FEATURES.filter((f) => f.publica).map((f) => ({ path: f.ruta, component: ShellPublico, loadChildren: f.rutas })),
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: FEATURES.filter((f) => !f.publica).map((f) => ({ path: f.ruta, loadChildren: f.rutas })),
  },
  { path: 'sin-permiso', loadComponent: () => import('@layout/errores/sin-permiso-page') },
  { path: '**', loadComponent: () => import('@layout/errores/no-encontrado-page') },
];
```

Las rutas internas de cada feature siguen en su `<feature>.routes.ts`:

```ts
// features/inventario/stock/stock.routes.ts
export default [
  {
    path: '',
    canActivate: [permissionGuard('stock:leer')],
    loadComponent: () => import('./pages/stock-page'),
    title: 'Stock y variantes',
  },
] satisfies Routes;
```

### 5.5 Navegación

`core/navigation/navegacion.ts` reúne los `nav` de todas las features, los ordena por grupo y `orden`, y los filtra
según los permisos del usuario. De ahí salen el menú lateral y las migas. No existe una lista central de ítems.

### 5.6 Seguridad: autenticación y permisos

**Flujo:**

1. El login envía las credenciales; el backend responde con la cookie httpOnly y los datos del usuario.
2. Al iniciar la aplicación, `provideAppInitializer` consulta `/api/auth/me` y carga el `AuthStore`.
   Sin sesión válida, el usuario queda como anónimo y el guard redirige a `/login?volver=<ruta>`.
3. Los guards y el menú leen el `AuthStore`. **Nunca** `localStorage`.
4. Un 401 durante el uso limpia el store y redirige al login conservando la ruta. Un 403 lleva a `/sin-permiso`.

```ts
// core/auth/auth.store.ts
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _usuario = signal<UsuarioSesion | null>(null);
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);
  readonly permisos = computed(() => permisosDe(this._usuario()?.rol));
  puede(permiso: Permiso): boolean { return this.permisos().has(permiso); }
  // iniciar(), cerrarSesion(), cargarSesion()…
}
```

**Permisos por acción.** Los componentes y guards preguntan por permisos, no por roles. Cada feature declara en
su `<feature>.feature.ts` qué roles reciben sus permisos; `core/auth/permisos.registry.ts` los reúne al iniciar.
La tabla siguiente es la referencia que esas declaraciones deben respetar.

Roles de empleados:

| Permiso | GERENTE | VENDEDOR | OPERARIO_DEPOSITO | ADMINISTRATIVO |
|---|:-:|:-:|:-:|:-:|
| `panel:leer` | ✔ | resumido | resumido | ✔ |
| `ventas:registrar` (mostrador y redes sociales) | ✔ | ✔ | | |
| `ventas:leer` | ✔ | ✔ | | ✔ |
| `ventas:cancelar` | ✔ | | | |
| `mayoristas:administrar` (clientes, ventas, cobros) | ✔ | | | |
| `devoluciones:registrar` / `devoluciones:verificar` | ✔ | ✔ | ✔ | |
| `devoluciones:evaluar` | ✔ | | | |
| `pedidos:gestionar` (preparación y despacho) | ✔ | | ✔ | |
| `stock:leer` | ✔ | ✔ | ✔ | ✔ |
| `stock:ajustar` | ✔ | | ✔ | |
| `productos:leer` | ✔ | ✔ | ✔ | ✔ |
| `productos:editar` / `precios:editar` / `descuentos:editar` | ✔ | | | |
| `recepciones:registrar` | ✔ | | ✔ | |
| `recepciones:resolver` (incidencias) | ✔ | | | ✔ |
| `compras:gestionar` (órdenes de compra) | ✔ | | | ✔ |
| `proveedores:gestionar` (proveedores, compromisos, pagos) | ✔ | | | ✔ |
| `analisis:leer` (pronóstico, sin rotación, reportes) | ✔ | | | ✔ |
| `auditoria:leer` | ✔ | | | |
| `usuarios:administrar` / `parametros:editar` | ✔ | | | |

Roles de clientes (solo `mi-cuenta` y tienda): `CLIENTE_MINORISTA` consulta sus pedidos y solicita devoluciones;
`CLIENTE_MAYORISTA` consulta su historial, cuotas pendientes y crédito disponible.

> Matriz propuesta a partir de RNS-ROL-01 y de los actores de los casos de uso. El equipo la valida en la fase 0
> del plan de desarrollo.

Para ocultar acciones en un template se usa la directiva estructural:

```html
<app-button *can="'stock:ajustar'" (click)="abrirAjuste()">Registrar ajuste</app-button>
```

Ocultar un botón no reemplaza la validación: el backend controla cada permiso.

### 5.7 Comunicación HTTP y errores

**Interceptors** (funcionales, registrados con `withInterceptors`), en este orden:

| Orden | Interceptor | Responsabilidad |
|---|---|---|
| 1 | `apiBaseInterceptor` | Antepone `/api` o `/ds-api` según el prefijo lógico de la URL |
| 2 | `credentialsInterceptor` | `withCredentials: true` |
| 3 | `errorInterceptor` | Convierte `HttpErrorResponse` en `ApiError`; resuelve 401 y 403; deja pasar el resto |

**Contrato de error** a acordar con el backend (App-web no lo tenía estandarizado):

```ts
export interface ApiError {
  status: number;
  code: string;                              // 'SKU_DUPLICADO', 'STOCK_INSUFICIENTE', 'VALIDACION'…
  mensaje: string;                           // texto técnico; la interfaz usa el catálogo
  campos?: Record<string, string>;           // errores por campo: { sku: 'SKU_DUPLICADO' }
}
```

**Dónde se muestra cada error:**

| Situación | Tratamiento |
|---|---|
| Error de validación de un campo (`campos`) | Debajo del campo, con `applyServerErrors(form, error)` |
| Error de negocio de una acción (stock insuficiente, precio duplicado) | Aviso de error en el panel de la acción |
| Falla al cargar los datos de un panel (red, 500) | Aviso dentro del panel con «Reintentar»; el resto de la pantalla sigue operativa |
| Acción completada | Notificación efímera abajo a la derecha (guía 7.8), 4 segundos |
| Sesión vencida (401) | Redirección al login conservando la ruta |
| Sin permiso (403) o ruta inexistente | Página `/sin-permiso` o «Página no encontrada» |

Los textos salen de `core/http/error-catalog.ts` (`code → texto`) y cumplen las reglas de redacción de
`CLAUDE.md`: formales, impersonales y sin coloquialismos.

### 5.8 Datos y estado

- **Lecturas:** `httpResource` (o `rxResource`) alimentado por signals. Al cambiar el signal, la petición se
  repite sola y los estados de carga y error quedan disponibles para la plantilla.
- **Escrituras:** `HttpClient` desde el `.api.ts`. Para acciones que no deben duplicarse (cobrar, guardar) se usa
  `exhaustMap` o se deshabilita el botón mientras la acción está en curso.
- **Store por feature** solo cuando varias pantallas comparten estado (por ejemplo, el ticket del mostrador). Es un
  servicio con signals; no se usa NgRx. Si una feature lo justifica más adelante, se evalúa `@ngrx/signals`.
- **Caché:** no hay al inicio. Si un listado lo necesita, se agrega por recurso, con invalidación explícita.

Tablas paginadas con `PageQuery`, sincronizado con la URL:

```ts
// shared/data-access/page-query.ts
export interface PageQuery {
  pagina: number;
  tamanio: number;
  orden?: string;
  direccion?: 'asc' | 'desc';
  filtros?: Record<string, string>;
}

// en una page
readonly query = pageQueryDesdeUrl({ tamanio: 50, orden: 'nombre' });   // signal ligado a los query params
readonly stock = httpResource<Paginado<StockFilaDto>>(() => this.api.listarUrl(this.query()));
```

Servicio CRUD genérico, por composición (sin herencia):

```ts
// features/inventario/productos/data-access/productos.api.ts
@Injectable({ providedIn: 'root' })
export class ProductosApi {
  private readonly crud = crudApi<ProductoAltaDto, ProductoDetalleDto, ProductoEdicionDto, ProductoFilaDto>('productos');
  readonly listarUrl = this.crud.listarUrl;
  readonly obtener = this.crud.obtener;
  readonly crear = this.crud.crear;
  readonly actualizar = this.crud.actualizar;
  // operaciones propias:
  registrarPrecio(id: number, dto: PrecioAltaDto) { /* … */ }
}
```

### 5.9 Formularios

- **Formularios reactivos tipados** con `NonNullableFormBuilder`. Sin `!` para leer valores.
- **Un solo `form-page` por entidad** para alta y edición: si la ruta trae `:id`, carga el registro y cambia el
  título y la acción («Crear producto» / «Guardar cambios»).
- Validaciones de forma (requerido, largo, formato) en el cliente. Las reglas de negocio las valida el backend y
  vuelven por `applyServerErrors`.
- Validadores propios en `shared/forms/validators/` (por ejemplo, CUIT).
- Signal Forms queda para evaluar más adelante; no se usa en esta entrega.

### 5.10 Tipos compartidos con el backend

- El backend expone su contrato en OpenAPI. Los tipos del frontend se generan con `openapi-typescript` en
  `core/http/generated/` y no se editan a mano.
- Los DTOs de cada feature reexportan o adaptan esos tipos.
- Las constantes compartidas (estados, códigos de error) salen del mismo contrato; no se copian a mano entre
  proyectos.

### 5.11 Interfaz

**Librería de componentes.** No se usa el tema visual de Angular Material (guía 16.4). Se usa **Angular CDK** para
el comportamiento accesible (diálogos, overlay, foco, stepper, breakpoints) y **componentes propios** en
`shared/ui` según la guía, sección 7.

**Del prototipo a Angular:**

| Prototipo (`prototipo-paletas/`) | Destino en Angular |
|---|---|
| `assets/paletas.css`, bloque `[data-paleta="petroleo"]` | `styles/tokens/colors.css` |
| `assets/tipografias.css`, bloque `[data-tipo="catalogo"]` | `styles/tokens/typography.css` |
| `assets/base.css` | Estilos de cada componente de `shared/ui` y de `layout/` |
| `assets/app.js`: `ars()`, `nf()` | Pipes `ars` y `numero` en `core/formatters` |
| `assets/app.js`: `barraLateral()`, íconos `IC` | `layout/sidebar` + `lucide-angular` |
| `assets/app.js`: `barrasApiladas()`, `spark()`, `pronostico()` | Componentes de gráficos (futuros: panel y predicción) |
| `erp-mostrador.html`, `erp-stock.html` | Pantallas de referencia de las features del alcance actual |
| `assets/tokens.json` | Fuente de colores para los reportes que genere FastAPI |

**Reglas obligatorias:** sin colores hexadecimales en componentes, sin sombras difusas ni degradados, radios de
hasta 6 px, montos con el pipe `ars`, números de tabla alineados a la derecha con `tabular-nums`, estados siempre
con `<app-estado>`.

**Fuentes:** `@fontsource-variable/archivo` y `@fontsource/red-hat-mono` (pesos 400 y 500), importadas en
`styles.scss` (guía 2.3).

**Responsive:** breakpoints de la guía, sección 14 (1500, 1100 y 760 px). El mostrador se diseña para escritorio y
tablet apaisada; en celular solo se consulta stock.

**Accesibilidad:** guía, sección 15 (foco visible, `aria-label` en botones de ícono, `role="img"` en gráficos,
estados con texto además de color).

### 5.12 Entornos y despliegue

El frontend usa siempre rutas relativas. No hay IP ni dominio en el código.

```json
// frontend/proxy.conf.json (desarrollo, dentro de Docker Compose)
{
  "/api":    { "target": "http://backend:3000", "secure": false },
  "/ds-api": { "target": "http://ds-api:8000", "secure": false, "pathRewrite": { "^/ds-api": "" } }
}
```

```nginx
# frontend/nginx.conf (producción)
location /api/    { proxy_pass http://backend:3000; }
location /ds-api/ { proxy_pass http://ds-api:8000/; }
location /        { try_files $uri $uri/ /index.html; }
```

Al servir todo desde el mismo origen no se requiere configuración de CORS. El `Dockerfile` multi-stage actual se
mantiene.

### 5.13 Mercado Pago (al final de la entrega)

- Se usa en el checkout de la tienda (CUU2.1), en el POS para débito y crédito (CUU1.2) y en los reintegros de
  devoluciones cobradas por esa vía (CUU10.3).
- Hasta la fase 7 del plan, el backend expone un procesador de pago simulado con el mismo contrato; el frontend
  no cambia al reemplazarlo.
- El frontend nunca maneja credenciales ni datos de tarjeta: el backend crea la operación y el frontend muestra
  su estado (pendiente, aprobado, rechazado).
- El rechazo vuelve al paso de selección de medio de pago (CUU1.2 camino 2.a, CUU2.1 camino 3.a).
- Se detalla en este documento cuando se aborde.

---

## 6. Features del sistema

El orden en que se construyen y su responsable están en el plan de desarrollo.

| Feature | Ruta | Pantallas principales | Casos de uso | Permiso de acceso |
|---|---|---|---|---|
| `auth` | `/login`, `/tienda/ingresar` | Inicio de sesión de empleados y de clientes | — | Público |
| `panel` | `/panel` | Panel del día (guía 10.1) | CUU11.1 | `panel:leer` |
| `ventas/mostrador` | `/ventas/mostrador` | POS (guía 10.2) | CUU1.1 a 1.3 | `ventas:registrar` |
| `ventas/redes-sociales` | `/ventas/redes-sociales` | Registro manual con opción de envío | CUU12.1 | `ventas:registrar` |
| `ventas/historial` | `/ventas` | Listado, detalle con comprobante y cuotas, cancelación | — | `ventas:leer` |
| `ventas/pedidos` | `/ventas/pedidos` | Cola de preparación, bultos, despacho y entrega (guía 10.5) | CUU2.2 | `pedidos:gestionar` |
| `ventas/mayoristas` | `/ventas/mayoristas` | Clientes, ficha con cuenta corriente, venta mayorista, cobro de cuotas | CUU7.1 a 7.5 | `mayoristas:administrar` |
| `ventas/devoluciones` | `/ventas/devoluciones` | Solicitudes, evaluación, verificación y nota de crédito | CUU10.1 a 10.4 | `devoluciones:*` |
| `inventario/productos` | `/inventario/productos` | Listado, `form-page`, variantes con fotos, historial de precios | CUU9.1, 9.2, 9.4 | `productos:leer` |
| `inventario/stock` | `/inventario/stock` | Tabla con variantes y panel de detalle (guía 10.3), ajuste manual | CUU1.1, CUU9.5 | `stock:leer` |
| `inventario/sin-rotacion` | `/inventario/sin-rotacion` | Detección por período y promoción de liquidación | CUU8.1, 8.2 | `analisis:leer` |
| `inventario/recepciones` | `/inventario/recepciones` | Recepción con remito adjunto y control contra la orden (guía 10.4, sin OCR) | CUU4.1 a 4.4 | `recepciones:registrar` |
| `compras/ordenes` | `/compras/ordenes` | Sugerencias, borrador, emisión en PDF, seguimiento | CUU5.1, 5.2 | `compras:gestionar` |
| `compras/proveedores` | `/compras/proveedores` | Proveedores, compromisos, pagos, cuenta corriente, vencimientos | CUU5.3, CUU6.1 a 6.3 | `proveedores:gestionar` |
| `analisis/prediccion` | `/analisis/prediccion` | Pronóstico con nivel de confianza (guía 11) | CUU11.2 | `analisis:leer` |
| `analisis/reportes` | `/analisis/reportes` | Reportes de los requerimientos de análisis de la Etapa 3 | — | `analisis:leer` |
| `auditoria` | `/auditoria` | Lista de cambios con filtros (guía 10.5) | — | `auditoria:leer` |
| `config/*` | `/config/...` | Usuarios, categorías, descuentos, parámetros | CUU9.3 | `usuarios:administrar`, `parametros:editar`, `descuentos:editar` |
| `tienda` | `/tienda` | Catálogo, ficha, carrito con reserva, checkout (guía 12) | CUU2.1 | Público |
| `mi-cuenta` | `/mi-cuenta` | Pedidos, devoluciones y, para mayoristas, cuenta corriente | CUU2.3, CUU7.3, CUU10.1 | Rol de cliente |

Atajos del mostrador (guía 10.2): `F2` búsqueda, `F4` cliente, `F8` medio de pago, `F12` cobrar, `Esc` quitar la
última línea.

---

## 7. Plantilla de una feature

Ejemplo completo: `inventario/stock`.

```
features/inventario/stock/
├─ stock.routes.ts
├─ data-access/
│  ├─ stock.api.ts
│  └─ models/
│     ├─ stock-fila.dto.ts
│     ├─ variante-detalle.dto.ts
│     └─ ajuste-alta.dto.ts
├─ pages/
│  └─ stock-page.ts            tabla + filtros + panel de detalle, PageQuery en la URL
└─ components/
   ├─ stock-detalle.ts         panel derecho (input: variante seleccionada)
   └─ ajuste-dialog.ts         formulario de ajuste manual (output: ajuste confirmado)
```

**Checklist para crear una feature nueva:**

- [ ] Carpeta en `features/` con la estructura de la sección 5.2.
- [ ] `<feature>.routes.ts` con `export default` y `permissionGuard` en cada ruta.
- [ ] `<feature>.feature.ts` con rutas, ítems de menú y permisos por rol.
- [ ] Feature agregada en `app.features.ts` (una línea).
- [ ] Permisos nuevos reflejados en la tabla de la sección 5.6.
- [ ] DTOs basados en los tipos generados del backend.
- [ ] `.api.ts` sin lógica de pantalla; las `pages` no llaman a `HttpClient` directamente.
- [ ] Estados de carga (esqueleto), vacío y error con «Reintentar» en cada panel.
- [ ] Códigos de error nuevos agregados al catálogo con su texto.
- [ ] Textos revisados con las reglas de `CLAUDE.md`.
- [ ] Checklist de aceptación de la guía, sección 17.
- [ ] Tests de la sección 9.

---

## 8. Convenciones

| Tema | Convención |
|---|---|
| Idioma | Dominio en español (`producto`, `variante`, `venta`); términos técnicos en inglés (`store`, `api`, `page`, `guard`) |
| Archivos | kebab-case con sufijo: `stock-page.ts`, `stock.api.ts`, `stock.store.ts`, `stock-fila.dto.ts`, `auth.guard.ts`, `ars.pipe.ts` |
| Clases | PascalCase sin sufijo `Component`: `StockPage`, `StockDetalle`, `AjusteDialog` |
| Selectores | Prefijo `app-`: `<app-estado>`, `<app-data-table>` |
| Componentes | Standalone, `OnPush`, `input()`, `output()`, `inject()`; template en archivo aparte cuando supera unas 30 líneas |
| Estado | `signal` privado con versión pública de solo lectura (`asReadonly()`) |
| Suscripciones | Se evitan; si son necesarias, `takeUntilDestroyed()` |
| Estilos | Solo tokens `var(--…)`; sin hexadecimales; estilos de componente encapsulados |
| Textos de interfaz | Reglas de `CLAUDE.md`: formales, impersonales, botones en infinitivo |
| Formato de código | Prettier (configuración del repo) + ESLint (`angular-eslint` y `eslint-plugin-boundaries`) |
| Commits | Conventional Commits en una línea, según `CLAUDE.md` |

---

## 9. Testing

| Qué | Herramienta | Alcance |
|---|---|---|
| Stores, pipes, guards, mapeo de errores, `PageQuery` | Vitest | Obligatorio para todo lo nuevo en `core` y `shared/data-access` |
| Componentes de `shared/ui` críticos (`data-table`, `estado`, `field`) | Vitest + Angular Testing Library | Comportamiento visible, no detalles internos |
| Flujos completos | Playwright | Inicio de sesión, alta de producto con variante, venta en mostrador |

Los archivos `.spec.ts` vacíos no se commitean.

---

## 10. Inconsistencias detectadas en la documentación

Diferencias encontradas entre la Etapa 3, la guía de diseño y el repositorio. El equipo debe resolverlas antes de
implementar las features afectadas.

| # | Inconsistencia | Fuentes | Afecta a |
|---|---|---|---|
| 10.1 | La guía 6.3 usa actores (empleado de mostrador, logística de recepción, logística de despacho, encargado de compras, analista, administrador) distintos de los 6 roles de RNS-ROL-01 | Guía 6.3 · Etapa 3 | Permisos y menú |
| 10.2 | La guía 10.2 lista 6 medios de pago (incluye transferencia, QR Mercado Pago y cuenta corriente); RNS-MPG-01 define 3 (efectivo, débito, crédito) | Guía 10.2 · Etapa 3 | Mostrador |
| 10.3 | RN13 (una promoción no puede superponerse con otra) contradice RNS-DESC-07 (se aplica la de mayor beneficio) | CURS9 · Etapa 3 | Promociones (futuro) y mostrador |
| 10.4 | CUU9.1 pide «SKU» y «marca» al producto; las reglas definen `codigo_interno` en el producto, SKU por variante, y no existe la entidad Marca | CUU9.1 · RNS-STK-10/11 | Productos |
| 10.5 | El flujo de CUU9.5 (ajuste de stock) está copiado de CUU9.3 y describe una promoción | CUU9.5 | Stock |
| 10.6 | CUU1.1 devuelve «ubicación en depósito» y la guía usa «punto de pedido»; ninguno de los dos figura en las reglas ni en el modelo de stock | CUU1.1 · Guía 1.8 y 10.2 | Stock y mostrador |
| 10.7 | «Pendiente de facturación» (CURS01, camino 3.a) no es un estado de venta en RNS-VENTA-05 | CURS01 · RNS-VENTA-05 | Mostrador e historial |
| 10.8 | El riesgo R08 menciona PostgreSQL; `docker-compose.yml` usa MySQL 8.4 | Etapa 3 · Repositorio | Backend |

---

## 11. Referencias

**Referencia analizada (App-web, `Front_V2/src/app/`):**
[app.routes.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/app.routes.ts) ·
[app.config.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/app.config.ts) ·
[baseCrudService.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/shared/base/baseCrudService.ts) ·
[basePagedComponent.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/shared/base/basePagedComponent.ts) ·
[error.interceptor.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/core/interceptors/error.interceptor.ts) ·
[auth.guard.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/core/guards/auth.guard.ts) ·
[cache-service.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/core/services/cacheService/cache-service.ts) ·
[menu-service.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/core/services/menuService/menu-service.ts) ·
[dialog-service.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/shared/services/dialogService/dialog-service.ts) ·
[libros-read.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/features/libros/components/read/libros-read.ts) ·
[libros-update.ts](https://github.com/AgosUTN/App-web/blob/main/Front_V2/src/app/features/libros/components/update/libros-update.ts) ·
[Evaluación técnica y mejoras propuestas.md](https://github.com/AgosUTN/App-web/blob/main/docs/Evaluaci%C3%B3n%20t%C3%A9cnica%20y%20mejoras%20propuestas.md)

**Documentación del proyecto:**

| Documento | Secciones usadas |
|---|---|
| Entrega 1 | Objetivos, procesos 01 a 05 |
| Entrega 2 | Factibilidad técnica, arquitectura cloud, decisión Tiendanube |
| Etapa 3 | Actores, reglas de negocio, casos de uso 1 y 9, alcance del prototipo (137 PF), riesgos R02 y R08 |
| `GUIA_DISENO_CHAMPAGNE_FLORENTINA.md` | Partes 1 y 2; secciones 1.8, 5, 6, 7, 8, 10, 14, 15, 16 y 17 |
| `prototipo-paletas/` | `paletas.css`, `tipografias.css`, `base.css`, `app.js`, pantallas del ERP |
