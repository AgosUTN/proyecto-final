# CLAUDE.md

## Textos del sistema

El sistema se vende a otras empresas: cada texto que ve un usuario tiene que transmitir **excelencia y
profesionalismo**. Vale para pantallas, ayudas, diálogos, errores, avisos, correos, parámetros y mockups.

- **Formal e impersonal.** Sin «vos» ni «usted», sin primera persona del sistema y sin giros coloquiales.
- **Redacción de un documento de la empresa, no de una conversación.** No se usan «acá», «después», «mal», «hay
  que», «se va», «sale», «lo que no tiene vuelta atrás» ni preguntas coloquiales como título.

| Incorrecto                                     | Correcto                                            |
| ---------------------------------------------- | --------------------------------------------------- |
| Lo que no tiene vuelta atrás                   | Acción irreversible                                 |
| Si después el recibo de una persona estaba mal | Ante un error en el recibo de sueldo de una persona |
| ¿Qué pasa al cerrar?                           | Efectos del cierre                                  |
| ¿Cómo se corrige un recibo?                    | Procedimiento de corrección del recibo              |

- **Botones en infinitivo** y vocabulario del sistema: «correo electrónico», «Seleccionar», «Eliminar», «importe».
- **«Recibo de sueldo»**, nunca «de haberes». Sin dos puntos explicativos ni «(s)» en los plurales.
- Antes de entregar un texto nuevo, releerlo preguntando si lo firmaría una empresa ante un cliente.

## Frontend

Las reglas del frontend están en `.claude/rules/frontend.md` y se cargan al trabajar en `frontend/`. Incluyen
la arquitectura (`frontend/docs/arquitectura-frontend.md`) y el sistema de diseño (`frontend/docs/design-system.md`).

## Commits

Los mensajes de commit siguen [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Formato — **una sola línea, sin cuerpo**:

```
<tipo>[ámbito opcional][!]: <descripción>
```

- **Tipos**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Ámbito**: el contexto tocado, entre paréntesis. Ej.: `feat(vacaciones):`, `fix(empleados):`.
- **Descripción**: imperativo, minúscula inicial, sin punto final. Máximo ~72 caracteres en total.
- **Breaking changes**: `!` antes de los dos puntos.
- Nada de párrafos explicativos ni listas en el mensaje. Si el cambio necesita
  contexto, va en la documentación del repo, no en el commit.

Ejemplos:

```
feat(ausencias): registrar justificantes adjuntos
fix(vacaciones): corregir cálculo de días hábiles en cambio de año
refactor(fundaciones)!: separar agregado de la capa de persistencia
```

**NO añadir nunca** los trailers `Co-Authored-By: Claude ...` ni `Claude-Session: ...` a los commits ni a los cuerpos de PR.

## Documentación vigente

- El modelo de dominio está en `docs/modelo-dominio.md`. Es la única fuente para entidades, atributos y relaciones.
- No buscar documentación eliminada en el historial de git (`git log`, `git show`, checkout de commits anteriores). El plan de desarrollo quedó descartado y no se usa.
