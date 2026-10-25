# Reporte de vulnerabilidades — **Inspectores RB** (Android)

| Campo | Valor |
|---|---|
| **Destinatario** | Equipo de desarrollo de **Tecso** (`www.tecso.coop`) |
| **Aplicación** | «Inspectores RB» — paquete `io.ionic.inspectores` |
| **Versión analizada** | `1.0.20200115` (`versionCode 15`, 15-01-2020) |
| **Artefacto** | `insp-rb-v1.0.20200115.apk` (14,1 MB, 596 entradas) |
| **Tipo de análisis** | Estático (SAST de artefacto) — **sin pruebas dinámicas ni contra backend** |
| **Fecha** | 14/10/2026 |
| **Clasificación** | Confidencial — para el responsable de la aplicación |
| **Documentos asociados** | `REPORTE-ANALISIS-INSPECTORES-RB.md`, `PANTALLAS-Y-PERMISOS.md` |

> **Nota metodológica.** Los CVSS v3.1 son **estimaciones orientativas**: al ser un análisis 100 % estático, el impacto en el backend no pudo validarse. Tres hallazgos (T‑010 a T‑012) se presentan como **“por verificar”** y requieren confirmación del lado servidor. La “Prioridad” (P1/P2/P3) considera el **efecto cadena**, no solo el CVSS.

---

## 1. Resumen ejecutivo

La aplicación entrega a los inspectores de Rosario Bus funciones de consulta de horarios, carga de **informes de infracción**, **planillas de incógnitos**, **desvíos** y **rastreo GPS continuo** sobre una API propia. El análisis identificó **15 hallazgos**: 1 crítico, 4 altos, 6 medios y 4 bajos (3 de ellos pendientes de verificación).

**El problema central es una cadena:** la app se distribuyó como una **build de desarrollo** (`debuggable=true` + firma de depuración) que **guarda credenciales reales en texto claro** y las transmite **por HTTP sin cifrar**, mientras **publica su código fuente completo** en los source maps. Un atacante con acceso físico al dispositivo (o con ADB) obtiene contraseñas reutilizables, GPS histórico de los inspectores y la totalidad de la superficie de ataque sin necesidad de vulnerar nada.

**Riesgo de negocio destacado:** la app procesa **datos personales sensibles** (DNI, CUIL, legajo, domicilio laboral) y **geolocalización continua de trabajadores** — obligaciones de la Ley 25.326 (y su actualización, Ley 27.733) de protección de datos personales.

### Tabla resumen

| ID | Hallazgo | CVSS | Severidad | Prioridad | CWE |
|---|---|---|---|---|---|
| **T‑001** | `android:debuggable="true"` en la build publicada | **9,1** | 🔴 Crítico | **P1** | CWE‑489 |
| **T‑002** | Tráfico HTTP plano: credenciales, JWT, GPS y datos personales | **8,7** | 🟠 Alto | **P1** | CWE‑319 / CWE‑300 |
| **T‑003** | Contraseña en texto claro en el dispositivo + login offline + persistencia tras logout | **8,3** | 🟠 Alto | **P1** | CWE‑312 / CWE‑522 |
| **T‑004** | Source maps con `sourcesContent` publicados (código fuente completo) | **5,8** | 🟡 Medio | **P1** (cadena) | CWE‑200 |
| **T‑005** | Firma con keystore de depuración (`Android Debug`) | **4,9** | 🟡 Medio | **P1** (cadena) | CWE‑345 |
| **T‑006** | JWT almacenado en `localStorage` | **5,6** | 🟡 Medio | P2 | CWE‑922 |
| **T‑007** | `allowBackup` por defecto `true` con datos sensibles | **4,9** | 🟡 Medio | P2 | CWE‑530 |
| **T‑008** | `console.log` con datos sensibles en producción (115) | **3,3** | 🔵 Bajo | P2 | CWE‑532 |
| **T‑009** | Whitelist Cordova `<access origin="*">` + `allow-intent http://*/*` | **3,3** | 🔵 Bajo | P2 | CWE‑939 |
| **T‑010** | Controles de permisos **solo en cliente** | — | ⚪ Por verificar | **P1** | CWE‑602 |
| **T‑011** | Sin límite visible de intentos de login (`Loguin_CantidadIntentos` sin usar) | — | ⚪ Por verificar | **P1** | CWE‑307 |
| **T‑012** | `targetSdk 26` / Angular 5 / Ionic 3 EOL / HockeyApp descontinuado | — | ⚪ Por verificar | P2 | CWE‑1104 |
| **T‑013** | SiteKey de reCAPTCHA embebida sin restricción observable | — | 🔵 Bajo | P3 | CWE‑798¹ |
| **T‑014** | Permisos Android sin uso aparente (`BLUETOOTH`, `WRITE_EXTERNAL_STORAGE`) | — | 🔵 Bajo | P3 | CWE‑250 |
| **T‑015** | Detección de entorno inconsistente y control de menú con `[hidden]` | — | 🔵 Bajo | P3 | CWE‑693 |

¹ La siteKey reCAPTCHA es pública por diseño; el hallazgo es la ausencia de restricción visible, no la fuga en sí.

---

## 2. Hallazgos detallados

### T‑001 · Build de producción con `android:debuggable="true"`
**🔴 Crítico · CVSS 9,1** `AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` · CWE‑489 · **P1**

**Descripción.** El `AndroidManifest.xml` compilado declara `<application … debuggable="true">`. Una build destinada a producción con depuración habilitada permite, a cualquier proceso con acceso ADB autorizado (o a un dispositivo condepuración USB activada), ejecutar `run-as` sobre la app, extraer su directorio privado completo, inyectar código en el proceso (JDWP) y modificar su comportamiento en tiempo de ejecución.

**Evidencia.** `AndroidManifest.xml` → atributo `debuggable="true"` en `<application>` (decodificado con parser AXML propio; visible también con `aapt dump xmltree AndroidManifest.xml application`).

**Impacto.** Lectura/escritura de `inspectores.db` (credenciales en texto claro — véase T‑003), robo del JWT vigente (`localStorage`), alteración de informes antes de enviarlos y ejecución de código arbitrario con la identidad de la app.

**Reproducción.**
1. `apkanalyzer manifest print insp-rb-v1.0.20200115.apk | grep -i debuggable` → `debuggable="true"`.
2. Con el APK instalado y ADB autorizado: `adb shell run-as io.ionic.inspectores ls databases/` (funciona porque la app es debuggable).
3. `adb shell run-as io.ionic.inspectores cat databases/inspectores.db > /tmp/i.db` → tabla `usuarios`.

**Remediación.** Eliminar `debuggable` de la build release (`applicationVariants` con `debuggable false` / `assembleRelease`), validar con `apkanalyzer` en el pipeline y bloquear el artefacto si aparece.

**Esfuerzo.** < 0,5 día + verificación en CI.

---

### T‑002 · Tráfico HTTP plano hacia la API
**🟠 Alto · CVSS 8,7** `AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H` · CWE‑319 / CWE‑300 · **P1**

**Descripción.** Los tres servicios backend se consumen por **HTTP sin TLS** sobre una IP pública:

```
http://200.13.41.31:5000/ROSBUS.WebService.Admin
http://200.13.41.31:5000/ROSBUS.WEBSERVICE.GEO
http://200.13.41.31:5000/ROSBUS.WebService.Siniestros
```

No hay `networkSecurityConfig`, y con `targetSdk 26` el tráfico cleartext está permitido por defecto (la restricción solo aplica desde `targetSdk 28`).

**Evidencia.** `src/environments/environment.dev.ts:12-14` (recuperado de `build/main.js.map`); ausencia de `<meta-data android:name="android:networkSecurityConfig">` en el manifiesto; `<access origin="*">` en `res/xml/config.xml`.

**Contenido expuesto.** `POST /api/Auth/loginMobile` con **DNI + contraseña en JSON**, el **JWT** en cada petición (`Authorization: Bearer`), informes de infracción (conductor, motivo, ubicación), planillas de incógnitos, **coordenadas GPS** de los inspectores y datos laborales (DNI/CUIL/legajo).

**Impacto.** Cualquier actor en la misma red (Wi‑Fi de la empresa, terminal, ruta, proveedor) puede interceptar y reutilizar credenciales y sesiones, reescribir informes o inyectar respuestas falsas (la app no valida el servidor).

**Reproducción.**
1. Instalar la app en un dispositivo y conectarlo a una red controlada con proxy transparente (`mitmproxy`/`Wireshark`).
2. Iniciar sesión: el cuerpo `{username, password}` se lee en claro.
3. Filtrar `Authorization: Bearer` en cualquier request posterior.

**Remediación.**
1. TLS en los 3 servicios (certificado válido) y migrar `environment` a `https://`.
2. `res/xml/network_security_config.xml` con `cleartextTrafficPermitted="false"` + `base-config` con pinning de certificado (o `TrustKit`).
3. Subir `targetSdkVersion` a 34+ (obligatorio además para Play).
4. Forzar rotación de todas las contraseñas expuestas.

**Esfuerzo.** 2–4 días (certificado + config + build) · 1 día si ya existe TLS en el balanceador.

---

### T‑003 · Contraseña en texto claro en el dispositivo y login offline
**🟠 Alto · CVSS 8,3** `AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N` · CWE‑312 / CWE‑522 · **P1**

**Descripción.** En cada login exitoso la app persiste la contraseña **en claro**, en dos sitios:

1. **SQLite** — `db.addUsr(dni, password)` → tabla `usuarios(dni, pass)`.
2. **Ionic Storage** (localStorage/IndexedDB) — `storage.set('loginStoragePass', pass)` si se marca “Recordarme”.

Además, **el logout no borra esa información**: `AuthenticationService.logout()` solo limpia `localStorage` y los permisos; la tabla `usuarios` se elimina únicamente al hacer un login posterior.

Y, como la app permite **sesión sin conexión** (`sesionSinConexion()`), la validación se hace **localmente**: `usr.dni === this._dni && usr.pass === this._password`.

**Evidencia.**
- `src/pages/login/login.ts:123` → `this.db.addUsr(this._dni, this._password);`
- `src/pages/login/login.ts:182` → comparación local de credenciales.
- `src/pages/login/login.ts:219-223` → `storageCredenciales()`.
- `src/providers/db/db.service.ts:47-49` → `CREATE TABLE usuarios (… dni TEXT, pass TEXT)`.
- `src/providers/auth/AuthenticationService.ts:36-45` → `logout()` sin purgar la BD.

**Impacto.** Las credenciales son **reutilizables** contra otros sistemas si hay reutilización de claves, y son extraíbles con T‑001, T‑007 o desde un dispositivo robado/root. El login offline convierte la contraseña almacenada en un *bearer* local permanente.

**Reproducción.** Ver T‑001 paso 3; abrir `/tmp/i.db` con cualquier visor SQLite → `SELECT * FROM usuarios`. Alternativa sin ADB: `adb backup -f b.ab io.ionic.inspectores` en un dispositivo con `targetSdk` antiguo (véase T‑007).

**Remediación.**
1. **No guardar la contraseña.** Para el modo offline: guardar un *hash* de verificación local (mejor: un token offline de vida corta firmado por el servidor) o eliminar el login offline.
2. Borrar la tabla `usuarios` y las claves de Storage **en el logout**.
3. Cifrar la BD con SQLCipher (`cordova-sqlite-storage` lo soporta) o usar el `EncryptedSharedPreferences`/Keystore del sistema.
4. Activar `android:allowBackup="false"` (T‑007) y rotar claves.

**Esfuerzo.** 2–3 días (incluye decidir el mecanismo offline con el equipo de backend).

---

### T‑004 · Código fuente completo expuesto en los source maps
**🟡 Medio · CVSS 5,8** `AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N` · CWE‑200 · **P1 por efecto cadena**

**Descripción.** Los **24 source maps** publicados en `assets/www/build/*.js.map` incluyen el campo **`sourcesContent`** con el **texto original de cada archivo TypeScript**. Con ellos se reconstruyó íntegramente el proyecto (106 archivos, ~7 700 líneas de TypeScript), incluyendo `environment.dev.ts`, nombres de endpoints, modelos de datos, permisos y claves.

**Evidencia.**
- `assets/www/build/main.js.map` → `"sourcesContent":["import { PermissionCheckerService …"]`.
- `assets/www/build/0.js.map` … `21.js.map` → páginas completas.
- Rutas del proyecto embebidas en las plantillas: `C:\prj\PLANIFICACION\Prod\inspectores-app\src\pages\…`.

**Impacto.** Un atacante conoce sin esfuerzo toda la superficie de ataque: 40+ endpoints, estructura de permisos (`Inspectores.*`), nombres de tablas SQLite, parámetros de `SysParameters` y la lógica de negocio completa. Acelera explotar T‑002/T‑003/T‑010.

**Reproducción.**
```bash
unzip insp-rb-v1.0.20200115.apk -d apk
grep -l sourcesContent apk/assets/www/build/*.js.map   # 24 archivos
grep -o '"sources":\[[^]]*\]' apk/assets/www/build/main.js.map
```

**Remediación.** Desactivar `devtool` en la build de producción (o `hidden-source-map` + subirlos solo al repositorio de símbolos), publicar *solo* `.js`/`.css`, y añadir una verificación al build que falle si aparece `sourcesContent`.

**Esfuerzo.** < 0,5 día.

---

### T‑005 · Firma con el keystore de depuración
**🟡 Medio · CVSS 4,9** `AV:P/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N` · CWE‑345 · **P1 operativo**

**Descripción.** El APK está firmado con el certificado por defecto del SDK: **`CN=Android Debug, O=Android`** (creado 04/09/2018, válido hasta 2048). `META-INF/MANIFEST.MF` indica `Created-By: Android Gradle 3.0.0`, `Built-By: Generated-by-ADT`.

**Impacto.** La app publicada no tiene cadena de identidad verificable; además, cualquier equipo que disponga de ese keystore puede generar actualizaciones “legítimas” (la app además instala actualizaciones por HockeyApp — T‑012). Si el keystore se pierde, la app **no puede actualizarse**. Google Play no acepta firmas de depuración para paquetes nuevos.

**Remediación.** Keystore de release propio, custodiado (Play App Signing si se distribuye por Play), y bloquear en CI: verificar el subject del certificado (`keytool -printcert -jarfile app.apk`).

**Esfuerzo.** 0,5 día.

---

### T‑006 · JWT en `localStorage`
**🟡 Medio · CVSS 5,6** `AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N` · CWE‑922 · P2

**Descripción.** El token se guarda con `localStorage.setItem('currentUser', JSON.stringify(user))` y se lee con `JSON.parse` en `AuthService.getToken()`.

**Impacto.** Cualquier JavaScript ejecutado en la WebView (XSS, contenido local inyectado, carga de un recurso remoto — véase T‑009) extrae la sesión vigente. En Android, `localStorage` de la WebView vive en el directorio privado de la app (accesible con T‑001/T‑007).

**Evidencia.** `src/providers/auth/AuthenticationService.ts:29-31`; `src/providers/auth/auth.service.ts:9-14`.

**Remediación.** Mover el token a almacenamiento nativo cifrado (`SharedPreferences` cifrado con Keystore / plugin `cordova-plugin-secure-storage`) y usar `sessionStorage` como mínimo.

**Esfuerzo.** 1–2 días.

---

### T‑007 · `allowBackup` activo con datos sensibles
**🟡 Medio · CVSS 4,9** `AV:P/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N` · CWE‑530 · P2

**Descripción.** El manifiesto **no declara** `android:allowBackup`; con `targetSdk 26` el valor por defecto es **`true`**.

**Impacto.** Permite extraer `/data/data/io.ionic.inspectores` (BD SQLite con credenciales, `localStorage` con JWT y permisos) vía `adb backup` en equipos con depuración o vía copia de seguridad en dispositivos sin cifrado.

**Remediación.** `android:allowBackup="false"` (+ `fullBackupContent="false"`); si se requiere backup, excluir explícitamente `databases/` y el almacenamiento de la WebView. Combinar con T‑003 (datos cifrados).

**Esfuerzo.** < 0,5 día.

---

### T‑008 · Volcado de datos sensibles en consola
**🔵 Bajo · CVSS 3,3** `AV:L/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N` · CWE‑532 · P2

**Descripción.** **115 `console.log`** en el bundle de producción. Ejemplos: `console.log("CURRENT USER:", this.currentUsr)`, `console.log("this._PermissionList:::::", …)`, `console.log("LISTGEO:", listGeo)` (con coordenadas), `console.log("INFORME DB:", info)`, `console.log("Start Geolocation! con " + …)`.

**Impacto.** Con T‑001 (WebView devtools) o cualquier registro de consola se exponen usuario, permisos, posiciones GPS e informes.

**Remediación.** Hook de `console.*` en build de producción (terser `drop_console`) y revisar los logs que vuelcan entidades completas.

**Esfuerzo.** < 0,5 día.

---

### T‑009 · Whitelist de Cordova demasiado abierta
**🔵 Bajo · CVSS 3,3** `AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N` · CWE‑939 · P2

**Descripción.** `res/xml/config.xml` declara `<access origin="*">` y `allow-intent` para `http://*/*` y `https://*/*`.

**Impacto.** Cualquier origen remoto puede ser consumido por la app; amplía el impacto de un XSS o de la carga de contenido externo (que, en combinación con T‑006, permitiría robar el JWT).

**Remediación.** Restringir `access origin` a los hosts del backend, eliminar `allow-intent http://*/*` si no se usan y bloquear la navegación a orígenes externos.

**Esfuerzo.** 0,5 día.

---

### T‑010 · Controles de permisos exclusivamente en el cliente ⚪ *por verificar*
**P1 · CWE‑602**

**Descripción.** Los 6 permisos (`Inspectores.Informes.Agregar`, `Inspectores.Diagramacion.Consultar`, `Inspectores.RegistrarPlanillaIncognitos.Agregar`, `Inspectores.Desvio.Visualizar/Agregar/Eliminar`) solo deciden **qué se muestra**. El menú usa `[hidden]` (el nodo permanece en el DOM), no hay guardas de ruta, y el cliente **no envía el permiso en cada petición** (solo el JWT).

Riesgo concreto detectado: `InformeTask` hace *fallback* a `POST /InfInformes/EnviarInformeJson` ante errores **distintos de 401/403**; si ese endpoint no valida permisos, es una **vía de evasión** del control `Inspectores.Informes.Agregar`. La página `DesvioPage` está **comentada en el menú pero compilada** y es invocable por nombre.

**Verificar en backend.**
- [ ] 403 para cada endpoint de escritura sin el rol correspondiente.
- [ ] `/InfInformes/EnviarInformeJson` valida `Inspectores.Informes.Agregar`.
- [ ] `/InsDesvios/*` valida `Visualizar` / `Agregar` / `Eliminar` por separado.
- [ ] `RecuperarConductores` y `GET /User/GetByIdAsync` restringen DNI/CUIL según rol.
- [ ] El JWT se invalida al logout (el cliente solo borra la copia).

---

### T‑011 · Sin límite de intentos de login visible ⚪ *por verificar*
**P1 · CWE‑307**

**Descripción.** El parámetro `Loguin_CantidadIntentos` existe en `src/models/parameter.model.ts:6` pero **no se referencia en ningún otro punto de la aplicación**: no hay bloqueo ni back‑off en el cliente. El captcha solo aparece tras un error de captcha, no como control sistemático.

**Verificar en backend.** Rate‑limit / bloqueo por usuario y por IP en `POST /api/Auth/loginMobile`, y uso efectivo del parámetro.

---

### T‑012 · Componentes obsoletos (EOL) ⚪ *por verificar*
**P2 · CWE‑1104**

**Descripción.**
- `targetSdkVersion 26` (Play exige 34+) · `minSdkVersion 19`.
- **Angular 5.2.11** y **Ionic 3.9.2** — versiones sin soporte desde 2019; `@angular/http` deprecado.
- Cordova y plugins de 2017‑2018 (geolocation 3.0.0, background-mode 0.7.2, diagnostic 4.0.10, sqlite 2.6.0).
- **HockeyApp fue discontinuado** (app id `70ac617590ed45f2a79f518d35edebd9`), pero la app mantiene `REQUEST_INSTALL_PACKAGES` y `UpdateActivity` para instalar APKs desde ese canal.
- Servicio worker declarado pero deshabilitado; `environment.production = false` (build de entorno DEV).

**Remediación.** Plan de migración a **Capacitor + Angular actual**, distribución de updates vía Play/App Center, eliminación de `REQUEST_INSTALL_PACKAGES` si ya no se usa, y activación de la cadena de actualización automática de Android.

**Esfuerzo.** Proyecto (4–8 semanas según alcance).

---

### T‑013 · SiteKey de reCAPTCHA sin restricción observable
**🔵 Bajo · CWE‑798¹ · P3**

`siteKey: '6LdugHMUAAAAAPIJReRrzeDjs9QZUoKvpiV5C6Ns'` en `src/app/app.module.ts:128` y en `login.html`. La clave es pública por diseño; verificar en la consola de reCAPTCHA las **restricciones de dominio/paquete de app** para evitar abuso del cuota en otras aplicaciones.

**Esfuerzo.** 0,1 día.

---

### T‑014 · Permisos Android sin uso aparente
**🔵 Bajo · CWE‑250 · P3**

- `android.permission.BLUETOOTH` — sin referencias en el código de la app.
- `android.permission.WRITE_EXTERNAL_STORAGE` con `maxSdkVersion="18"` — residual, no aplica en Android 4.4+ (minSdk 19).
- `android.permission.WAKE_LOCK` — necesario para el `ForegroundService` de background mode (justificado).

**Remediación.** Eliminar los permisos no usados (reduce superficie y evita preguntas en la revisión de Play).

**Esfuerzo.** 0,2 día.

---

### T‑015 · Controles de interfaz débiles y detección de entorno inconsistente
**🔵 Bajo · CWE‑693 · P3**

- Menú con `[hidden]="!p.permission"` → el ítem sigue en el DOM y es inspeccionable/activable.
- `tools.isBrowser()` usa `platform.is("mobileweb")` mientras `menu.ts` usa `is('core')` → en un navegador **desktop** se intenta usar SQLite/geolocalización y falla en silencio (login offline no disponible, errores no manejados).
- `MenuPage.pages` se calcula una sola vez en el constructor: cambios de permisos en sesión no se refrescan.
- El interceptor **no gestiona 401/403** (código comentado): una sesión expirada no redirige a login.

**Remediación.** Unificar la detección de plataforma, usar `*ngIf`, refrescar permisos al reanudar la app y reactivar el manejo de sesión expirada.

---

## 3. Hallazgos funcionales (no seguridad) detectados

Incluidos por su impacto operativo en la inspección:

| # | Hallazgo | Evidencia |
|---|---|---|
| F‑01 | **Intervalos nulos**: si `SysParameters` no devuelve valor, `parametrosNumerico()` da `null` → `setInterval(fn, null)` en `CheckHockeyAppUpdatesTask.Run()` dispara un **bucle a 0 ms** llamando a HockeyApp; en `GeoProvider` `this.parametroValue.toString()` lanza `TypeError` y **el tracking no inicia**. | `checkHockeyAppUpdatesTask.ts:31-35`, `geo.ts:90`, `tools.ts:35-36` (defaults solo para 2 de 5 parámetros) |
| F‑02 | **Coordenadas con signo invertido** (`* -1`) en tracking, logout e informes de infracción. | `geo.ts:192,210,270`, `menu.ts:114`, `informe-agregar.ts:260-261` |
| F‑03 | **Posible duplicado de informes**: *fallback* a `/EnviarInformeJson` ante cualquier error no‑401. | `InformeTask.ts:60-67` |
| F‑04 | **Doble cierre**: `ValidateisLocationEnabled()` llama `closeapp()` dos veces y hace logout sin drenar la cola GPS. | `geo.ts:134-142` |
| F‑05 | Logout sin borrar la cola de geolocalización pendiente si no hay red (se encola, pero la sesión ya terminó). | `menu.ts:118-131` |
| F‑06 | Páginas huérfanas: `DesvioPage` y `NuevoDesvioPage` quedan compiladas con el menú comentado. | `menu.ts:66`, `desvio.ts` |

---

## 4. Hoja de ruta de remediación

| Prioridad | Acciones | Esfuerzo |
|---|---|---|
| **P1 (inmediata)** | T‑001 build release · T‑005 firma release · T‑004 quitar source maps · T‑002 HTTPS + pinning · T‑003 eliminar contraseña en claro y purgar en logout · verificar T‑010 y T‑011 | **1–2 semanas** |
| **P2 (corto plazo)** | T‑007 `allowBackup=false` · T‑006 token en almacenamiento nativo · T‑008 `drop_console` · T‑009 whitelist estricta · T‑012 plan de migración de stack · F‑01..F‑06 | **2–4 semanas** |
| **P3 (mantenimiento)** | T‑013 restricción reCAPTCHA · T‑014 permisos sin uso · T‑015 coherencia de UI y sesión | **1 semana** |

**Verificación posterior:** repetir el análisis sobre la nueva build con los mismos checks automatizables (presencia de `debuggable`, subject del certificado, presencia de `sourcesContent`, `cleartextTrafficPermitted`, `allowBackup`).

---

## 5. Consideraciones de protección de datos

La aplicación recopila y transmite **datos personales sensibles**: DNI, CUIL, legajo, fecha de ingreso/antigüedad, nombre de conductores e **historial de geolocalización de los inspectores** con intervalos parametrizables (defecto 20 s), incluso en segundo plano y al hacer logout.

- **Base legal y finalidad:** debe estar documentada (Ley 25.326 / actualización Ley 27.733 — derecho de acceso, información, y obligaciones de seguridad).
- **Medidas mínimas recomendadas:** cifrado en tránsito (T‑002) y en reposo (T‑003/T‑007), minimización de retención de coordenadas, y revisión de quién accede al backend de `GEO`.
- El tracking continuo de trabajadores debe estar **notificado y aceptado** por el personal.

---

## 6. Anexo A — Inventario de endpoints observados (para revisión del backend)

```
POST /api/Auth/loginMobile
GET  /User/GetPermissionForCurrentUser
GET  /User/GetPagedList · /User/GetByIdAsync · POST /User/SaveNewEntity · /User/UpdateEntity
GET  /SysParameters/GetAllAsync
GET  /InfInformes/ConsultaInformeUserDia · POST /InfInformes/SaveNewEntity · /InfInformes/EnviarInformeJson
POST /InspPreguntasIncognitos/GetPagedList
     /InspPlanillaIncognitos/SaveNewEntity · UpdateEntity · GetAllAsync
GET  /InsDesvios/GetDesviosPorUnidaddeNegocio · POST /InsDesvios/DeleteById · SaveNewEntity
GET  /InspDiagramasInspectores/DiagramacionPorDia
GET  /Linea/GetLineasPorUsuario · /Linea/GetLineasActivasPorFecha · /Linea/RecuperarLineasPorConductor
     /HServicios/RecuperarServiciosPorLinea · RecuperarConductores · RecuperarConductoresPorServicio
     /HServicios/RecuperarLineasPorConductor · /HServicios/ObtenerEmpleadoInspector
     /Bandera/RecuperarHorariosSectorPorSector · RecuperarBanderasRelacionadasPorSector
     /SentidoBandera/RecuperarSentidoPorSector · /Sector/RecuperarSabanaPorSector
     /TipoLinea/RecuperarTipoLineaPorSector · /Coordenadas/RecuperarCoordenadasPorFecha
     /MotivoInfra/GetItemsAsync · /TiposDeDias/GetAllAsync · /HDesignar/* · /HFechas/*
GET  /CCoches/RecuperarCCoches · /CCoches/RecuperarCCochesPorFechaServicioLinea   (Siniestros)
POST /Geo/SaveEntityList · /Geo/CerrarSesion                                      (GEO)
```

**Verificar:** autenticación en **todos**, validación de rol por operación, rate‑limit en login, expiración/revocación del JWT y registro de auditoría de lecturas de datos personales.

## 7. Anexo B — Artefactos del análisis

| Artefacto | Contenido |
|---|---|
| `REPORTE-ANALISIS-INSPECTORES-RB.md` | informe técnico completo de la app |
| `PANTALLAS-Y-PERMISOS.md` | catálogo de 22 pantallas + modelo de permisos |
| `_analisis/src/` | 106 archivos `.ts` originales (recuperados de los source maps) |
| `_analisis/plantillas/` | 28 plantillas HTML (22 páginas + 5 componentes + app.html) |
| `_analisis/axml.py`, `extraer.sh`, `plantillas.py` | extractores reproducibles |

---

*Reporte elaborado con técnicas de análisis estático de artefactos. No se realizó ninguna prueba de intrusión ni se contactó el backend `200.13.41.31`. Se recomienda coordinar con Tecso la verificación de los hallazgos T‑010 a T‑012 antes de su publicación externa.*
