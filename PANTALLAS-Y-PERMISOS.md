# Pantallas y modelo de permisos — **Inspectores RB** (`io.ionic.inspectores` v1.0.20200115)

> Documento complementario a `REPORTE-ANALISIS-INSPECTORES-RB.md`.
> Fuente: código TypeScript y plantillas HTML recuperados de los source maps y de las plantillas inlineadas en los bundles webpack (`_analisis/src/` y `_analisis/plantillas/`).

---

## PARTE A — Modelo de permisos completo

### A.1 Origen y ciclo de vida

```
Login OK ──► GET /ROSBUS.WebService.Admin/User/GetPermissionForCurrentUser   (Bearer JWT)
                     │
                     ▼  DataObject = string[]  (p. ej. ["Inspectores.Informes.Agregar", ...])
        PermissionCheckerService.setPermissions(per)
                     │  localStorage["permisos_usuario"]  (JSON)
                     ▼
        PermissionCheckerService.loadPermissions()  → _PermissionList: string[]
                     │
                     ▼
        isGranted("Inspectores.…")  →  indexOf(nombre) != -1   (true/false)
                     │
        Logout ──► clearPermissions() → localStorage.removeItem("permisos_usuario")
```

- **Transporte:** `TokenInterceptor` agrega `Authorization: Bearer <jwt>` a `HttpClient`.
- **Persistencia:** `localStorage` (no `sessionStorage`) → **los permisos sobreviven a un reinicio de la app** hasta el próximo logout.
- **API de cliente:** `PermissionCheckerService.isGranted(nombre)` — comparación exacta por string (`indexOf`), sin jerarquías ni wildcard.
- **Carga puntual:** solo se consultan permisos **una vez, en el login**. No hay refresco en sesión ni al volver de segundo plano.

### A.2 Catálogo de permisos (los 6 existentes en el cliente)

| # | Permiso (string exacto) | Dónde se evalúa | Efecto en la UI | Pantalla / acción | Endpoint que debería proteger el backend |
|---|---|---|---|---|---|
| 1 | `Inspectores.Informes.Agregar` | `menu.ts` (`permisosMenu`), `informe.ts:32` (`isGranted`) | Muestra el ítem **“Informe”** del menú; muestra el **FAB “+”** de la lista de informes | Alta de informes de infracción | `POST /InfInformes/SaveNewEntity`, `POST /InfInformes/EnviarInformeJson` |
| 2 | `Inspectores.Diagramacion.Consultar` | `menu.ts` | Muestra el ítem **“Diagramación”** | Consulta de diagramación | `GET /InspDiagramasInspectores/DiagramacionPorDia` |
| 3 | `Inspectores.RegistrarPlanillaIncognitos.Agregar` | `menu.ts` | Muestra el ítem **“Planilla Incógnitos”** | Alta de planilla de incógnitos | `POST /InspPlanillaIncognitos/SaveNewEntity` |
| 4 | `Inspectores.Desvio.Visualizar` | `menu.ts` **(línea comentada)** | Ítem **“Desvío”** — *deshabilitado en el código* | Lista de desvíos | `GET /InsDesvios/GetDesviosPorUnidaddeNegocio` |
| 5 | `Inspectores.Desvio.Agregar` | `desvio.ts:37` | Muestra el **FAB “+”** de la página Desvío | Alta de desvío | `POST /InsDesvios/SaveNewEntity` |
| 6 | `Inspectores.Desvio.Eliminar` | `desvio.ts:36` | Muestra el ícono **papelera** en cada tarjeta | Baja de desvío | `POST /InsDesvios/DeleteById?id=` |

**Otros strings de autorización/parámetros presentes en el binario** (no son permisos de UI):

| String | Uso real |
|---|---|
| `Loguin_CantidadIntentos` (`parameter.model.ts`) | **Declarado pero nunca consumido** → el límite de intentos de login no se aplica en el cliente |
| `Inspectores_Geo_RealTimeTracking` | Intervalo de tracking GPS (defecto 20 000 ms) |
| `Inspectores_Geo_TiemposEntreHistorico` | Definido, **sin uso** |
| `Inspectores_Geo_TiempoEntreEnvios` | Definido, **sin uso** |
| `Inspectores_TimeToCheckVersionUpdate` | Chequeo de actualizaciones HockeyApp (defecto 24 h) |

### A.3 Qué NO requiere permiso (accesible a cualquier usuario autenticado)

| Pantalla | Condición |
|---|---|
| `HomePage` y sus 3 pestañas: **Sábanas** (`SabanaBanderaPage`), **Servicio/Conductor** (`BanderaConductorPage`), **Sector** (`SectorPage`) | `permission: true` en el menú |
| `ConsultasCachePage` (“Últimas Consultas”) | `permission: true` |
| `GrillaHorariosPage`, `ModalSectorHorarioPage`, `ModalServicioSeleccionadoPage`, `ModalSectorSeleccionadoPage`, `DatosConductorPage`, `VerMasInfoPage`, `SeleccionColumnasPage`, `InformeDetallePage`, `DatePickerPage` | sin evaluación de permiso |
| Cierre de sesión | `permission: true` |

> **Lectura:** el permiso solo decide *qué se ve en el menú y qué botones se muestran*. Un usuario sin permiso igual puede invocar cualquier endpoint si el backend no valida el rol en cada operación (la app no envía el permiso en cada request, solo el JWT).

### A.4 Mecanismo de ocultamiento y su límite

- Menú: `<ion-item [hidden]="!p.permission">` → el nodo **permanece en el DOM** (se puede inspeccionar/activar con herramientas de desarrollo).
- Botones: `*ngIf="allowAgregarInforme"` (Sí lo remueve del DOM) — patrón mixto en el código.
- **No existen guardas de ruta**: cualquier página se puede abrir por nombre (`nav.push('DesvioPage')`); el control real debe estar en la API.
- `MenuPage.pages` se calcula **una sola vez en el constructor**: si los permisos cambian durante la sesión no se refresca.

### A.5 Cadena de autorización completa observable en el cliente

1. `POST /api/Auth/loginMobile` → JWT + `username` + `sucursalId` (campo del usuario usado por Incógnitos).
2. `GET /User/GetPermissionForCurrentUser` → array de permisos.
3. Menú renderizado según permisos.
4. Cada request HTTP → `Bearer <jwt>` (interceptor).
5. Errores `401/403`: solo se muestra el toast `PERMISSION_ERROR_AUTHORIZATION` (“Existen datos pendiente de sincronización…”) — **no hay expiración de sesión automática**.

### A.6 Puntos a verificar obligatoriamente en el backend

- [ ] `loginMobile` tiene rate-limit / bloqueo tras N intentos y usa `Loguin_CantidadIntentos`.
- [ ] `GetPermissionForCurrentUser` y **todos** los endpoints de escritura validan el rol (no solo los de la tabla A.2).
- [ ] El JWT tiene `exp`, `iss`, `aud` válidos y se revoca al logout (el cliente solo borra la copia local).
- [ ] Un usuario sin `Inspectores.Informes.Agregar` recibe **403** en `/InfInformes/SaveNewEntity` (el cliente hace *fallback* a `/EnviarInformeJson` ante errores no-401: si el backend no valida allí, es una **puerta de evasión de permisos**).
- [ ] `/InsDesvios/*` valida `Visualizar`/`Agregar`/`Eliminar` por separado (el menú está comentado, pero la página sigue compilada y es invocable).
- [ ] Datos personales expuestos en `RecuperarConductores`, `DatosConductorPage` (DNI, CUIL, legajo, antigüedad) limitados al rol correspondiente.

---

## PARTE B — Catálogo completo de pantallas

**22 páginas** (`@IonicPage`, lazy chunks `0.js`–`21.js`) + **5 componentes** + `app.html`.
Ruta de origen real embebida en las plantillas: `C:\prj\PLANIFICACION\Prod\inspectores-app\src\…`

### Árbol de navegación

```
LoginPage ──(login OK)──► MenuPage ──► HomePage (root interno)
   │                          │            ├─ Tab "Sabana"        → SabanaBanderaPage
   │                          │            ├─ Tab "Servicio/Cond." → BanderaConductorPage
   │                          │            └─ Tab "Sector"         → SectorPage
   │                          │
   │                          ├─ Sábanas de Horarios  → HomePage
   │                          ├─ Informe              → InformePage            [permiso 1]
   │                          ├─ Diagramación         → DiagramacionPage       [permiso 2]
   │                          ├─ Planilla Incógnitos  → IncognitosPage         [permiso 3]
   │                          ├─ Últimas Consultas    → ConsultasCachePage
   │                          └─ Cerrar Sesión        → LoginPage
   └─ (sin conexión)──► ConsultasCachePage

SabanaBanderaPage ─push─► GrillaHorariosPage ─modal─► ModalServicioSeleccionadoPage
                                            └modal─► ModalSectorSeleccionadoPage
                                            └modal─► SeleccionColumnasPage
                                            └modal─► DatePickerPage
BanderaConductorPage ─push─► GrillaHorariosPage
SectorPage ─push─► ModalSectorHorarioPage
DiagramacionPage ─modal─► VerMasInfoPage
InformePage ─FAB─modal─► InformeAgregarPage ─modal─► DatosConductorPage
           ─push─► InformeDetallePage
DesvioPage ─FAB─modal─► NuevoDesvioPage          (página huérfana: menú comentado)
IncognitosPage ─push─► HomePage
(8 usos) ─modal─► DatePickerPage
```

### 1. `LoginPage` — chunk `12` · `src/pages/login/login.ts|html`

| | |
|---|---|
| **Rol** | Autenticación (página raíz) |
| **Campos** | DNI · Contraseña (botón ojo mostrar/ocultar) · “Recordarme” · reCAPTCHA (visible solo tras error de captcha) · botón **Entrar** |
| **Acciones** | `doLogin()` → con red: login → guarda `dni+pass` en SQLite (`addUsr`) → opcionalmente credenciales en Ionic Storage → arranca tracking + `InformeTask` + `IncognitosTask` → permisos → chequeo de update HockeyApp → `setRoot('MenuPage')`. Sin red: `sesionSinConexion()` → valida DNI/clave **contra la BD local** → `push('ConsultasCachePage')` + tracking |
| **Errores** | `code 1` usuario/clave (oculta captcha) · `code 2/3` captcha requerido/inválido (muestra y `grecaptcha.reset()`) |
| **Permisos** | — (puerta de entrada) |
| **Datos** | `localStorage.currentUser` (JWT), `currentUserName`, `loginStorageDni/Pass`, tabla `usuarios` |

### 2. `MenuPage` — chunk `11` · `src/pages/menu/menu.ts|html`

| | |
|---|---|
| **Rol** | Menú lateral (`ion-menu`) + root de navegación (`rootPage='HomePage'`) |
| **Ítems** | Sábanas de Horarios ✅ · Informe 🔒`Inspectores.Informes.Agregar` · *Desvío* 🔒`…Desvio.Visualizar` **(comentado)** · Diagramación 🔒`…Diagramacion.Consultar` · Planilla Incógnitos 🔒`…RegistrarPlanillaIncognitos.Agregar` · Últimas Consultas ✅ · Cerrar Sesión ✅ |
| **Extras** | Versión instalada (`AppVersion.getVersionNumber()`), imagen `bg-1.jpg` |
| **Cerrar sesión** | Confirma → obtiene posición actual → `Geo/CerrarSesion` (o encola en SQLite si no hay red) → `logout()` → `setRoot('LoginPage')` + `stopGeolocation()` + `backgroundMode.disable()` |
| **Back button** | `app.component` confirma salida; si es `LoginPage` sale de la app, si no envía `trackeoAlSalirApp('logout')` |

### 3. `HomePage` — chunk `16` · `src/pages/home/home.ts|html`

| | |
|---|---|
| **Rol** | Contenedor de 3 pestañas (`ion-tabs`) — pantalla inicial tras el login |
| **Tabs** | 🚩 *Sabana* → `SabanaBanderaPage` · 🚌 *Servicio/Conductor* → `BanderaConductorPage` · 📍 *Sector* → `SectorPage` |
| **Notas** | Inyecta `geo.navCtrl` (necesario para el logout desde `GeoProvider`); **sin permiso** |

### 4. `SabanaBanderaPage` — chunk `4` · `src/pages/sabana-bandera/*`

| | |
|---|---|
| **Rol** | Búsqueda de horarios por **fecha + línea + sentido (bandera)** |
| **Campos** | Fecha (DatePicker) · Línea · Sentido · lista de **Banderas Relacionadas** con “Seleccionar todas” y checkbox por ítem |
| **Acciones** | `Buscar()` (valida requeridos) · `doRefresh` (pull-to-refresh) · limpiar campos · hay un botón **TRACK** *comentado* en la plantilla |
| **Endpoints** | `Linea/GetLineasPorUsuario` · `SentidoBandera/GetItemsAsync` · `Bandera/RecuperarLineasActivasPorFecha`, `RecuperarBanderasRelacionadasPorSector`, `RecuperarHorariosSectorPorSector` |
| **Offline** | `db.addSabana(...)` (tabla `sabana`) → consulta posterior desde `ConsultasCachePage` |
| **Salida** | `push('GrillaHorariosPage', {horarios})` |

### 5. `BanderaConductorPage` — chunk `5` · `src/pages/bandera-conductor/*`

| | |
|---|---|
| **Rol** | Búsqueda de horarios por **conductor / servicio / línea** |
| **Campos** | Fecha · Conductores (buscable) · Línea · Servicio (botón limpiar) · Conductor (botón limpiar) |
| **Acciones** | `Buscar()` · `cleanServicio()` / `cleanConductor()` |
| **Endpoints** | `Linea/GetLineasPorUsuario` · `HServicios/RecuperarServiciosPorLinea`, `RecuperarConductores`, `RecuperarConductoresPorServicio`, `RecuperarLineasPorConductor` · `Bandera/RecuperarHorariosSectorPorSector` |
| **Offline** | `db.addPorConductor(...)`, `db.addServicioConductor(...)` |
| **Salida** | `push('GrillaHorariosPage', {horarios, servicio, conductor})` |

### 6. `SectorPage` — chunk `1` · `src/pages/sector/*`

| | |
|---|---|
| **Rol** | Búsqueda de horarios por **sector** (con validación secuencial de campos) |
| **Campos** | Fecha · Sectores (buscable, ≥3 caracteres, `ionic-selectable`) · Sentido (habilitado tras elegir sector) · Tipo de Línea (habilitado tras elegir sentido) |
| **Endpoints** | `Coordenadas/RecuperarCoordenadasPorFecha` · `Sector/RecuperarSentidoPorSector` · `TipoLinea/RecuperarTipoLineaPorSector` · `HDesignar/RecuperarSabanaPorSector` |
| **Offline** | `db.addSector(...)` |
| **Salida** | `push('ModalSectorHorarioPage', {horariosPorSector, sectorSeleccionado})` |

### 7. `GrillaHorariosPage` — chunk `17` · `src/pages/grilla-horarios/*`

| | |
|---|---|
| **Rol** | **Grilla de horarios** compartida (columnas dinámicas, modo horizontal/vertical) |
| **Campos** | Cabecera: Servicio · Sale · columnas dinámicas de sector (1–3 en vertical, 1–5 en landscape) · Band. · Llega · Frec. |
| **Acciones** | `selectColumns()` → modal `SeleccionColumnasPage` · click en fila → `ModalServicioSeleccionadoPage` · click en cabecera dinámica → `ModalSectorSeleccionadoPage` · `swipeEvent` (cambio de vista) |
| **Sin permisos** | Recibe todo por `NavParams` (no llama servicios) |

### 8. `SectorHorario` (`ModalSectorHorarioPage`) — chunk `10`

Modal “Búsqueda por Sector”: muestra `horariosPorSector` + sector seleccionado; botón Cancelar. Sin permiso.

### 9. `ModalServicioSeleccionadoPage` — chunk `8` · “Servicio seleccionado”

Detalle del servicio tocado en la grilla (horarios, relevo). Sin permiso.

### 10. `ModalSectorSeleccionadoPage` — chunk `9` · “Sector seleccionado”

Detalle del sector de la cabecera dinámica. Sin permiso.

### 11. `SeleccionColumnasPage` — chunk `7`

Modal “Columnas a mostrar”: checkbox por columna (`service`, `departure`, `flag`, `arrives`, `frecuency`) + botón **Listo**. Sin permiso.

### 12. `DatePickerPage` — chunk `20` · `src/pages/date-picker/*`

Calendario (`<ion-calendar>` de **ion2-calendar**): tarjeta con la fecha elegida, aceptar/cerrar; adaptado a landscape. **Usado por 8 pantallas** (fecha de sábana, sector, conductor, informe, notificación, desvío, incógnitos y diagramación). Sin permiso.

### 13. `Informes` (`InformePage`) — chunk `13` · `src/pages/informe/*` 🔒 **permiso 1**

| | |
|---|---|
| **Rol** | Lista de informes de infracción **del día del usuario** |
| **Campos** | Tarjetas: fecha/hora infracción, conductor, motivo, línea, servicio |
| **Acciones** | `doRefresh` · FAB “+” (solo con permiso) → modal `InformeAgregarPage` · click → `push('InformeDetallePage')` |
| **Endpoint** | `GET /InfInformes/ConsultaInformeUserDia` |
| **Estado vacío** | “No realizo informes el día de hoy” |

### 14. `InformeAgregarPage` — chunk `15` · `src/pages/informe-agregar/*` 🔒 **permiso 1**

| | |
|---|---|
| **Rol** | **Alta de informe de infracción** (formulario reactivo, 410 líneas — la página más grande) |
| **Campos** | Fecha Infracción · Hora · “Ud. está en el lugar del hecho” (`LugarHecho`) · Ubicación (`DscLugar`, se llena con `NativeGeocoder` inverso) · Línea · Servicio · Coche · Motivo · Notificado (checkbox) · Fecha Notificación (deshabilitada si no está notificado) · Observaciones |
| **Acciones** | `takeGeolocation()` → `getCurrentPosition()` y **lat/long × −1** → `getGeocoder()` · `verConductor()` → modal `DatosConductorPage` · `verOtrasLineas/verOtrosServicios/verOtrosCoches` · `GuardarInforme()` → online `infInformesService.createOrUpdate` (`POST /InfInformes/SaveNewEntity`) · offline `informeDb.addInforme(...)` (tabla `informeInfraccion`) |
| **Endpoints** | `Linea/GetLineas`, `HServicios/RecuperarServiciosPorLinea`, `HServicios/RecuperarLineasPorConductor`, `CCoches/RecuperarCCochesPorFechaServicioLinea` (siniestros), `MotivoInfra/GetItemsAsync` |
| **Validadores** | `LugarHecho` obliga ubicación; `Notificado` obliga fecha de notificación |

### 15. `InformeDetallePage` — chunk `14`

Vista de solo lectura: N° de informe, fecha, ubicación; **datos conductor** (nombre + legajo, línea, coche ficha/interno/dominio, servicio); **datos infracción** (motivo, notificado, fecha notificado, observación). Recibe todo por `NavParams`. Sin permiso propio.

### 16. `DatosConductorPage` — chunk `19`

Popover con datos personales del conductor: **D.N.I., Fecha de ingreso, Legajo, Fecha antigüedad, Empresa, CUIL**. Abierto desde `InformeAgregarPage`. **Sin permiso** ⇒ cualquier usuario autenticado ve DNI/CUIL.

### 17. `DiagramacionPage` — chunk `2` · `src/pages/diagramacion/*` 🔒 **permiso 2**

| | |
|---|---|
| **Rol** | Diagramación de inspectores por día |
| **Campos** | Fecha; tarjetas por inspector con legajo, turno, jornada (`HoraDesde–HoraHasta`), zona (click → modal `VerMasInfoPage`), franco trabajado, novedad (colores) |
| **Endpoint** | `GET /InspDiagramasInspectores/DiagramacionPorDia` |
| **Offline** | `diagramacionDb.addDiagramacion/getDiagramacion` |
| **Errores** | 401/403 → toast de permiso; sin datos → mensaje `msj` |

### 18. `IncognitosPage` — chunk `0` · `src/pages/incognitos/*` 🔒 **permiso 3**

| | |
|---|---|
| **Rol** | **Planilla de incógnitos** (control encubierto de calidad) |
| **Campos** | `*Fecha`, `*Hora Ascenso`, `Hora Descenso`, `*Interno` (coche, con ficha), `*Tarifa` (numérico), `Respuesta` (select, `RespuestaIncognitoId`), `Observación` |
| **Acciones** | `GuardarIncognitos()` → confirmación → online: `incognitosDetalleService.createOrUpdate` (`POST /InspPlanillaIncognitos/SaveNewEntity`) · offline: `incognitosDbService.addIncognitos` (tabla `planillaIncognitos`) |
| **Endpoints** | `InspPreguntasIncognitos/GetPagedList` (preguntas/respuestas), `InspPlanillaIncognitos/*` |
| **Validación** | `form.valid` (Reactive Forms); `cu.sucursalId` desde `currentUser` — si es `null` corta con alerta |
| **Salida** | `push('HomePage')` |

### 19. `DesvioPage` — chunk `18` 🔒 **permisos 4, 5, 6** *(menú comentado → huérfana)*

| | |
|---|---|
| **Rol** | Lista de desvíos de la unidad de negocio |
| **Acciones** | FAB “+” (`allowAgregarDesvio`) → modal `NuevoDesvioPage` · papelera (`allowEliminarDesvio`) → `delete(id)` |
| **Endpoints** | `GET /InsDesvios/GetDesviosPorUnidaddeNegocio`, `POST /InsDesvios/DeleteById?id=` |

### 20. `NuevoDesvioPage` — chunk `3`

Modal de alta: Fecha · Hora · Descripción (`placeholder` “Ingrese los detalles del desvio…”) · Cancelar / Guardar.
Endpoints: `InsDesvios/ObtenerEmpleadoInspector`, `POST /InsDesvios/SaveNewEntity`. Offline no aplica (valida conexión).

### 21. `ConsultasCachePage` — chunk `21` · “Últimas Consultas”

| | |
|---|---|
| **Rol** | **Vista offline** de las últimas búsquedas guardadas en SQLite |
| **Secciones plegables** | Sábana · Servicio/Conductor · Por Conductor · Sector (estado vacío: “Aún no se realizo ninguna consulta”) |
| **Acciones** | `horariosCache_sabana/porCond` → `push('GrillaHorariosPage')`; `horariosCache_porSector` → `push('ModalSectorHorarioPage')`; `close()` → confirma, detiene tracking y background, `logout` → `LoginPage` |
| **Permiso** | ✅ siempre visible |

### 22. `VerMasInfoPage` — chunk `6`

Modal pequeño: badge “Zona X” + detalle de la zona (usado desde Diagramación).

### Componentes (chunk `main`)

| Componente | Plantilla | Función |
|---|---|---|
| `NavbarComponent` | `main_navbar.html` | `{{text}}` (herencia de plantilla de Ionic) |
| `AccordionListComponent` | `main_accordion-list.html` | acordeón (usado en Últimas Consultas) |
| `ConductoresSearcheablesComponent` | `main_conductores-searcheables.html` | buscador de conductores (120 líneas) |
| `CochesSearcheablesComponent` | `main_coches-searcheables.html` | buscador de coches/internos |
| `TruncatedTextComponent` | `main_truncated-text.html` | texto truncado con límite (descripción de desvíos) |
| `MyApp` (`app.html`) | inline en `main.js` | raíz: statusbar, splash, back-button, red, `geo.inicializarBackgroundMode()`, HockeyApp |

---

## Resumen de cobertura

| Métrica | Valor |
|---|---|
| Páginas `@IonicPage` | 22 |
| Componentes | 5 + raíz |
| Plantillas HTML recuperadas | 28 |
| Permisos distintos en el cliente | 6 |
| Pantallas con permiso explícito | 4 (`Informe`, `Diagramación`, `Incógnitos`, `Desvío`) |
| Pantallas accesibles a cualquier autenticado | 18 |
| Pantallas **huérfanas** (no enlazadas) | `DesvioPage`, `NuevoDesvioPage` (menú comentado) |
| Páginas con soporte offline | Sábana, Servicio/Conductor, Por Conductor, Sector, Informe, Incógnitos, Diagramación, Geolocalización |
