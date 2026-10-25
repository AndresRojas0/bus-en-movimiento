# Reporte de análisis estático — App Android **«Inspectores RB»** (`insp-rb v1.0.20200115`)

> **Alcance:** análisis 100 % estático del APK y de su contenido (manifest, recursos, bundles JS, source maps).
> **No se realizaron peticiones activas contra el backend ni pruebas de intrusión.**
> **Fecha del análisis:** 14/10/2026 · **Artefacto:** `insp-rb-v1.0.20200115.apk` (14,1 MB)

---

## 1. Resumen ejecutivo

**Inspectores RB** es la aplicación híbrida de campo usada por los **inspectores de Rosario Bus** (empresa de transporte de pasajeros de Rosario, Argentina). Permite consultar horarios de colectivos (sábanas, banderas, sectores, diagramación), **levantar informes de infracción**, cargar **planillas de “incógnitos”** (controles de calidad encubiertos), registrar **desvíos**, y hace **rastreo GPS continuo en segundo plano** del inspector, con una capa de trabajo **sin conexión** (SQLite local + colas de sincronización).

- Desarrollada por **Tecso** (`comercial@tecso.com.ar`, `www.tecso.coop`).
- **Stack:** Cordova + **Ionic 3.9.2** + **Angular 5.2.11** (WebView híbrida), webpack, SQLite nativo.
- Backend propio: 3 servicios ASP.NET sobre **`http://200.13.41.31:5000`** (`ROSBUS.WebService.Admin`, `ROSBUS.WEBSERVICE.GEO`, `ROSBUS.WebService.Siniestros`).

**Hallazgos críticos (resumen):**

1. La build de producción está **`android:debuggable="true"`** y **firmada con el keystore de depuración** (`Android Debug`).
2. **Todo el tráfico es HTTP plano**: DNI + contraseña, JWT, informes de infracción, CUIL/legajos de conductores y coordenadas GPS viajan sin cifrar.
3. La **contraseña se guarda en texto claro** en el dispositivo (SQLite `usuarios(dni, pass)` e Ionic Storage) y **sobrevive al cierre de sesión**; además habilita un login offline que la valida localmente.
4. Los **source maps publicados** permiten recuperar el **código fuente TypeScript completo** (se extrajeron 106 archivos) — incluye endpoints, modelos, claves y lógica de negocio.
5. Stack EOL (Angular 5 / Ionic 3 / targetSdk 26) y servicio **HockeyApp descontinuado** con `REQUEST_INSTALL_PACKAGES`.

El detalle de seguridad está en **`REPORTE-VULNERABILIDADES-TECSO.md`**; el catálogo de pantallas y permisos, en **`PANTALLAS-Y-PERMISOS.md`**.

---

## 2. Identificación del paquete

| Campo | Valor |
|---|---|
| Nombre visible | **Inspectores RB** (`app_name` en `resources.arsc`) |
| Descripción | *“App para inspectores de Rosario Bus”* (en `res/xml/config.xml`) |
| Package name | `io.ionic.inspectores` |
| Actividad principal | `io.ionic.inspectores.MainActivity` (launcher, `launchMode=singleTask`) |
| versionName / versionCode | `1.0.20200115` / **15** (build del 15-01-2020) |
| minSdk / targetSdk | **19** (Android 4.4) / **26** (Android 8.0) |
| debuggable | **`true`** ⚠ |
| Firma | `CN=Android Debug, O=Android` — **keystore de depuración** (válido 04/09/2018 – 27/08/2048) |
| Empaquetado | `Created-By: Android Gradle 3.0.0`, `Built-By: Generated-by-ADT` |
| Tamaño | APK 14,1 MB · 596 entradas · 33,5 MB descomprimido |
| Proyecto de origen | `C:\prj\PLANIFICACION\Prod\inspectores-app\` (rutas embebidas en las plantillas) |

### Permisos declarados

| Permiso | Nota |
|---|---|
| `INTERNET` | tráfico a la API |
| `ACCESS_NETWORK_STATE` | detección offline |
| `ACCESS_COARSE_LOCATION` + `ACCESS_FINE_LOCATION` | tracking GPS |
| `uses-feature android.hardware.location.gps` | obliga GPS |
| `WAKE_LOCK` | background mode |
| `BLUETOOTH` | **sin uso aparente en el código** |
| `WRITE_EXTERNAL_STORAGE` (`maxSdkVersion=18`) | residual |
| `REQUEST_INSTALL_PACKAGES` | auto-actualización vía HockeyApp |

Componentes: `de.appplant.cordova.plugin.background.ForegroundService`, 5 actividades de HockeyApp, `GoogleApiActivity` (`exported=false`), meta-data de support-libs `26.1.0` y `arch.lifecycle 27.0.0-SNAPSHOT`.
**No se declara `allowBackup`** (por defecto `true`) **ni `networkSecurityConfig`**.

---

## 3. Stack tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│ APK (Cordova / Android)                                     │
│  ├─ WebView (com.ionicframework.cordova.webview)            │
│  │   └─ assets/www  →  SPA Angular 5 + Ionic 3              │
│  │        ├─ build/main.js (+ 22 chunks lazy)               │
│  │        ├─ build/*.js.map  ← ¡código fuente completo!     │
│  │        ├─ cordova.js + 17 plugins                        │
│  │        └─ assets/i18n/es.json, imgs/ (rosariobus.png)    │
│  ├─ classes.dex (3,3 MB): plugins + Google Play Services     │
│  ├─ lib/*/libsqlc-native-driver.so (5 ABIs) → SQLite local  │
│  └─ res/xml/config.xml (whitelist Cordova)                  │
└─────────────────────────────────────────────────────────────┘
                              │  HTTP (¡sin TLS!)
                              ▼
   http://200.13.41.31:5000/ROSBUS.WebService.Admin      (auth, maestros, permisos)
   http://200.13.41.31:5000/ROSBUS.WEBSERVICE.GEO        (geolocalización)
   http://200.13.41.31:5000/ROSBUS.WebService.Siniestros (coches / siniestros)
```

**Framework Ionic/Angular:** `index.html` declara `Ionic.version='3.9.2'`, `angular='5.2.11'`; locale `es-AR`, traducciones `@ngx-translate` (solo `es.json`), `moment`, `lodash`, `ion2-calendar`, `ionic-selectable`, `ng-recaptcha`, `ng2-truncate`.
**Service worker:** `service-worker.js` existe pero el registro está **comentado** en `index.html` (offline real = SQLite, no SW).

**17 plugins Cordova (con versiones):** whitelist 1.3.3 · device 2.0.2 · splashscreen 5.0.2 · ionic-webview 2.3.1 · ionic-keyboard 2.1.3 · es6-promise 4.2.2 · screen-orientation 3.0.1 · app-version 0.1.9 · network-information 2.0.1 · statusbar 2.4.2 · **cordova-sqlite-storage 2.6.0** · geolocation 3.0.0 · request-location-accuracy 2.2.3 · **background-mode 0.7.2** · **cordova.plugins.diagnostic 4.0.10** · nativegeocoder 3.2.2 · **hockeyapp 5.2.0**.

---

## 4. Backend y API

### 4.1 Configuración (`src/environments/environment.dev.ts`)

```ts
identityUrl:        'http://200.13.41.31:5000/ROSBUS.WebService.Admin'
geolocalizationUrl: 'http://200.13.41.31:5000/ROSBUS.WEBSERVICE.GEO'
siniestrosUrl:      'http://200.13.41.31:5000/ROSBUS.WebService.Siniestros'
production: false     // ← la app publicada usa el archivo de entorno DEV
```

Quedan comentadas variantes `http://localhost:64039/64040/64044` (desarrollo local).

### 4.2 Servicios y endpoints

| Servicio (clase) | Prefijo | Endpoints usados |
|---|---|---|
| `AuthenticationService` | `…Admin` | `POST /api/Auth/loginMobile` |
| `PermissionCheckerService`, `UserService` | `…Admin/User` | `GET /GetPermissionForCurrentUser`, `POST /GetPagedList`, `GET /GetByIdAsync?id=`, `POST /SaveNewEntity`, `POST /UpdateEntity` |
| `ParametersService` | `…Admin/SysParameters` | `GET /GetAllAsync` (parámetros por Token) |
| `InfInformesService` | `…Admin/InfInformes` | `GET /ConsultaInformeUserDia`, `POST /SaveNewEntity`, `POST /EnviarInformeJson` |
| `IncognitosService` | `…Admin/InspPreguntasIncognitos` | `POST /GetPagedList` |
| `IncognitosDetalleService` | `…Admin/InspPlanillaIncognitos` | CRUD `SaveNewEntity` / `UpdateEntity` / `GetAllAsync` |
| `DesvioService` | `…Admin/InsDesvios` | `GET /GetDesviosPorUnidaddeNegocio`, `POST /DeleteById?id=` |
| `DiagramacionService` | `…Admin/InspDiagramasInspectores` | `GET /DiagramacionPorDia` |
| `LineaService` | `…Admin/Linea` | `GET /GetLineasPorUsuario`, `GetLineasActivasPorFecha`, `RecuperarLineasPorConductor` |
| `HServiciosService` | `…Admin/HServicios` | `RecuperarServiciosPorLinea`, `RecuperarConductoresPorServicio`, `RecuperarConductores`, `ObtenerEmpleadoInspector` |
| `BanderaService` | `…Admin/Bandera` | `RecuperarHorariosSectorPorSector`, `RecuperarBanderasRelacionadasPorSector` |
| `SentidoBanderaService` | `…Admin/SentidoBandera` | `RecuperarSentidoPorSector` |
| `SectorService` | `…Admin/Sector` | `RecuperarSabanaPorSector` |
| `TipoLineaService` | `…Admin/TipoLinea` | `RecuperarTipoLineaPorSector` |
| `CoordenadasService` | `…Admin/Coordenadas` | `RecuperarCoordenadasPorFecha` |
| `HDesignarService` / `HFechasService` | `…Admin/HDesignar`, `/HFechas` | CRUD genérico |
| `MotivoService` | `…Admin/MotivoInfra` | `GetAllAsync` (motivos de infracción) |
| `TipoDiaService` | `…Admin/TiposDeDias` | `GetAllAsync` |
| `CocheService` | `…Siniestros/CCoches` | `RecuperarCCoches`, `RecuperarCCochesPorFechaServicioLinea` |
| `GeoService` | `…GEO/Geo` | `POST /SaveEntityList`, `POST /CerrarSesion` |

**Patrón CRUD genérico** (`CrudService<T>`): `GetAllAsync`, `GetItemsAsync`, `FindItemsAsync`, `GetByIdAsync`, `GetPagedList`, `SaveNewEntity`, `UpdateEntity`, `DeleteById`.

### 4.3 Autenticación y autorización

- `POST /api/Auth/loginMobile` con `{ username: DNI, password, captchaValue }` → respuesta con `token` (JWT) → `localStorage.currentUser` y `localStorage.currentUserName`.
- `TokenInterceptor` (HTTP de Angular) agrega `Authorization: Bearer <token>` a cada petición.
- **reCAPTCHA** (`ng-recaptcha`) visible solo tras un error de captcha; siteKey `6LdugHMUAAAAAPIJReRrzeDjs9QZUoKvpiV5C6Ns`.
- Permisos: `GET /User/GetPermissionForCurrentUser` → array de strings → `localStorage.permisos_usuario` → `PermissionCheckerService.isGranted(...)`.
- Errores `401/403`: **manejo comentado** en el interceptor (no hay logout automático ni redirección).
- Parámetros de servidor (`SysParameters`): `Inspectores_Geo_RealTimeTracking` (defecto 20000 ms), `Inspectores_Geo_TiemposEntreHistorico`, `Inspectores_Geo_TiempoEntreEnvios`, `Inspectores_TimeToCheckVersionUpdate` (defecto 86400000 ms) y **`Loguin_CantidadIntentos` declarado pero NO utilizado en el cliente**.

---

## 5. Arquitectura de datos offline

**BD local `inspectores.db` (SQLite):**

| Tabla | Contenido | Ciclo |
|---|---|---|
| `usuarios` | `dni`, **`pass` en texto claro** | se escribe en cada login; se borra solo al hacer `DELETE` previo de un nuevo login — **no se borra al cerrar sesión** |
| `sabana`, `servicioConductor`, `porConductor`, `sector` | última consulta de horarios por cada criterio | `DELETE` + `INSERT` por búsqueda → página *“Últimas Consultas”* |
| `informeInfraccion` | cola de informes pendientes | se vacía al enviar con éxito |
| `planillaIncognitos` | cola de planillas pendientes | idem |
| `geolocation` | cola GPS (`username, timestamp, latitud, longitud, accion`), `SELECT … LIMIT 10` | se envía en cada tick y se borra si `Status=true` |

**Flujos de sincronización:**
- `NetworkProvider.onConnect()` → `InformeTask.Run()` + `IncognitosTask.Run()`.
- Al hacer login (con conexión) se disparan ambas tareas y el tracking.
- `InformeTask`: si `createOrUpdate` falla con error **distinto de 401/403** hace *fallback* a `POST /EnviarInformeJson` (riesgo de duplicado si el servidor ya había persistido).

**Tracking GPS (`GeoProvider`):**
- `BackgroundMode.enable()` + `ForegroundService`; en `pause` sigue midiendo; `disableWebViewOptimizations()` al activar background.
- Intervalo = parámetro `Inspectores_Geo_RealTimeTracking` (defecto 20 s) con `enableHighAccuracy: true`, timeout 15 s.
- Acciones registradas: `login`, `trackPosition`, `logout`, `logoutSinConexión`, `logoutGpsDesactivado`.
- **Coordenadas se envían con el signo invertido (`* -1`)** en `geo.ts`, `menu.ts` e `informe-agregar.ts` — verificar contra el backend.
- Si el GPS está apagada, la app muestra *“ACTIVAR GPS!”* y, si no se activa, **cierra la sesión y sale de la aplicación**.
- El envío al servidor usa `Geo/SaveEntityList` y el cierre de sesión envía `Geo/CerrarSesion` con un último punto.

---

## 6. Pantallas y permisos

- **28 plantillas HTML** extraídas de los bundles (22 páginas lazy + componentes).
- **22 páginas** + componentes (`navbar`, `accordion-list`, `conductores-searcheables`, `coches-searcheables`, `truncated-text`).
- Navegación: `LoginPage` → `MenuPage` → `HomePage` (3 tabs: **Sabana** · **Servicio/Conductor** · **Sector**).

El detalle completo (árbol de navegación, campos, acciones y permisos por pantalla) está en **`PANTALLAS-Y-PERMISOS.md`**.

---

## 7. Hallazgos de seguridad (síntesis)

Los detalles, CVSS y planes de remediación están en **`REPORTE-VULNERABILIDADES-TECSO.md`** (IDs `T‑001`…`T‑015`).

| ID | Sev. | Hallazgo |
|---|---|---|
| T‑001 | **Crítico (9,1)** | `android:debuggable="true"` en la build publicada |
| T‑002 | **Alto (8,7)** | Todo el tráfico por **HTTP plano** a IP pública (credenciales, JWT, GPS, datos personales) |
| T‑003 | **Alto (8,3)** | Contraseña en **texto claro** en SQLite + Storage; **persiste tras el logout**; login offline la valida localmente |
| T‑004 | **Medio (5,8)** — P1 por cadena | Fuga de **código fuente completo** vía source maps publicados (24 mapas con `sourcesContent`) |
| T‑005 | **Medio (4,9)** — P1 operativo | Firmado con keystore de depuración `Android Debug` |
| T‑006 | **Medio (5,6)** | JWT almacenado en `localStorage` |
| T‑007 | **Medio (4,9)** | `allowBackup` por defecto `true` → la BD con credenciales es extraíble vía backup |
| T‑008 | **Bajo (3,3)** | 115 `console.log` en producción (usuario, permisos, coordenadas, informes) |
| T‑009 | **Bajo (3,3)** | Cordova `<access origin="*">` + `allow-intent http://*/*` |
| T‑010 | *por verificar* | Controles de permisos **solo en cliente** (menú con `[hidden]`, sin guardas de ruta) |
| T‑011 | *por verificar* | `Loguin_CantidadIntentos` sin uso → verificar rate-limit en `loginMobile` |
| T‑012 | *por verificar* | Stack EOL (Angular 5.2.11 / Ionic 3.9.2 / targetSdk 26) + **HockeyApp descontinuado** (app id `70ac617590ed45f2a79f518d35edebd9`) con `REQUEST_INSTALL_PACKAGES` |
| T‑013 | **Bajo** | SiteKey reCAPTCHA `6LdugHMUAAAAAPIJReRrzeDjs9QZUoKvpiV5C6Ns` sin restricción visible |
| T‑014 | **Bajo** | Permisos sin uso: `BLUETOOTH`, `WRITE_EXTERNAL_STORAGE` |
| T‑015 | **Bajo** | Detección de entorno inconsistente, `[hidden]` en menú, 401/403 sin manejar |

**Bien hecho:** JWT + interceptor, reCAPTCHA en login, whitelist Cordova, colas offline con reintento, permisos servidos por backend, sin credenciales de servidor ni API keys secretas embebidas, ausencia de tráfico a terceros sospechosos.

---

## 8. Problemas de código / calidad detectados

1. **`setInterval(..., null)`** — si `SysParameters` no devuelve el valor, `parametrosNumerico()` devuelve `null`:
   - `CheckHockeyAppUpdatesTask.Run()` ejecuta `setInterval(fn, null)` → **bucle a 0 ms** llamando a HockeyApp.
   - `GeoProvider.startGeolocationInternal()` hace `this.parametroValue.toString()` → **TypeError** → el tracking no inicia (promesa rechazada sin manejar).
2. **Signo invertido de latitud/longitud** (`* -1`) en tracking, logout e informes.
3. **Credenciales no purgadas en logout** (`AuthenticationService.logout()` limpia `localStorage`, no la tabla `usuarios`).
4. **Fallback `EnviarInformeJson`** ante errores no-401 → posible duplicado de informes.
5. **`ValidateisLocationEnabled()`** llama `closeapp()` dos veces y hace logout sin drenar la cola GPS.
6. **`tools.isBrowser()` = `platform.is("mobileweb")`** no detecta escritorio, mientras `menu.ts` usa `is('core')` → en desktop se intenta usar SQLite/geolocalización y falla en silencio.
7. **`ConsultasCachePage` / pestañas de Home** no tienen permiso asociado: cualquier usuario autenticado consulta todos los horarios.
8. Interceptor con manejo de `401/403` comentado → sesión expirada queda colgada.
9. Menú construye `pages` en el constructor: si los permisos cambian en sesión no se refresca.
10. `CrudService.delete()` ignora la respuesta del servidor.

---

## 9. Recomendaciones priorizadas

1. **Build de release**: `debuggable=false`, keystore propio / Play App Signing, `targetSdk` actual (34+).
2. **HTTPS + `networkSecurityConfig` (`cleartextTrafficPermitted="false"`) + certificate pinning** en los 3 servicios.
3. **No persistir la contraseña**: token de sesión offline de vida corta o hash local; borrar `usuarios` al hacer logout; cifrar la BD (SQLCipher) y `android:allowBackup="false"`.
4. Sacar el JWT de `localStorage` (almacenamiento nativo cifrado) y desactivar `console.log` en producción.
5. **Excluir los `.js.map` de la build pública** (publicarlos solo en el repositorio de símbolos).
6. Migrar a **Capacitor + Angular actual**; reemplazar HockeyApp (fuera de servicio) por App Center/Play y distribuir actualizaciones por la tienda.
7. Validar en backend: rate-limit en `loginMobile`, uso del parámetro `Loguin_CantidadIntentos`, autorización servidor-side en cada endpoint.
8. Revisar el signo de las coordenadas y los intervalos nulos (bug de disponibilidad).

---

## 10. Metodología y artefactos

**Técnicas aplicadas:** descompresión del APK · decodificación propia de AXML binario (`AndroidManifest.xml`, `res/xml/config.xml`) · lectura de `resources.arsc` y `META-INF` · extracción de firmas · análisis de `classes.dex` (strings) · **extracción de los source maps de webpack** (campo `sourcesContent`) · **extracción de plantillas inlineadas** (`template:` con anotación `ion-inline-start`) · revisión línea a línea del código recuperado.

**Artefactos generados** (en `/storage/emulated/0/insp-rb/`):

| Ruta | Contenido |
|---|---|
| `REPORTE-ANALISIS-INSPECTORES-RB.md` | este documento |
| `PANTALLAS-Y-PERMISOS.md` | modelo de permisos + catálogo de pantallas |
| `REPORTE-VULNERABILIDADES-TECSO.md` | reporte de vulnerabilidades para el equipo de Tecso |
| `_analisis/src/` | **106 archivos `.ts` originales** recuperados (carpeta `main/` + `0..21/` por página) |
| `_analisis/plantillas/` | **28 plantillas HTML** de páginas y componentes |
| `_analisis/extraer.sh` + `_analisis/plantillas.py` | extractores reproducibles |
| `_analisis/axml.py` | decodificador de AXML binario |

**Limitaciones:** no se ejecutó la app en un emulador/dispositivo, no se probó el backend, no se verificó el contenido de la BD real ni si existen builds posteriores a la 1.0.20200115. Los CVSS del reporte de vulnerabilidades son estimaciones orientativas sin validación dinámica.
