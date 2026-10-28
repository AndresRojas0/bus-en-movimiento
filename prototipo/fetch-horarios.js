#!/usr/bin/env node
/*
 * fetch-horarios.js — genera prototipo/horarios-reales.json desde el backend ROSBUS
 * Reproduce el flujo de la app (antes 4/003_sabana-bandera.ts):
 *   login  → POST /api/Auth/loginMobile {username,password,captchaValue}
 *   JWT    → header Authorization: Bearer ...
 *   líneas → GET  /Linea/GetLineasPorUsuario
 *   sentidos → GET /SentidoBandera/GetItemsAsync?LineaId=N
 *   banderas → GET /Bandera/RecuperarLineasActivasPorFecha?SentidoBanderaId=S&LineaId=N&Fecha=F
 *   horarios → POST /Bandera/RecuperarHorariosSectorPorSector {SentidoBanderaId,LineaId,BanderasSeleccionadas:[id],Fecha}
 * Fecha con formato de la app: YYYY-M-D (sin ceros, ver 4/003_sabana-bandera.ts:95).
 * Las credenciales se leen de credenciales.txt (raíz del repo) y NUNCA se imprimen ni se guardan en el JSON.
 *
 * Uso: node fetch-horarios.js [--fecha YYYY-M-D | --fecha YYYY-M-D] [--salida archivo.json]
 * (acepta '--fecha=2026-10-20' y '--fecha 2026-10-20'; sin --fecha usa hoy;
 *  --salida por defecto: horarios-reales.json; para el calendario usar
 *  horarios-habiles.json y horarios-mediofestivo.json, ver DISENO 12.3)
 */
const fs = require('fs');
const path = require('path');

const BASE = 'http://200.13.41.31:5000/ROSBUS.WebService.Admin';
const LINEAS_OBJETIVO = [101, 102, 103, 107, 110, 122, 125, 126, 128, 130, 133, 138, 139, 140, 142, 143, 144, 145, 146];
const flagVal = name => {
  const i = process.argv.findIndex(a => a.startsWith(name) && (a.includes('=') || a === name));
  if (i < 0) return null;
  const a = process.argv[i];
  return a.includes('=') ? a.split('=').slice(1).join('=') : process.argv[i + 1] || null;
};
const FECHA = (() => {
  const arg = flagVal('--fecha');
  if (arg) return arg;
  const hoy = new Date();
  return `${hoy.getFullYear()}-${hoy.getMonth() + 1}-${hoy.getDate()}`;
})();
const SALIDA = flagVal('--salida') || path.join(__dirname, 'horarios-reales.json');

function leerCredenciales() {
  const t = fs.readFileSync(path.join(__dirname, '..', 'credenciales.txt'), 'utf8');
  const lines = t.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error('credenciales.txt incompleto (usuario y contraseña en dos líneas)');
  return { user: lines[0], pass: lines[1] };
}

const norm = s => String(s || '')
  .toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^A-Z0-9]/g, '');

async function api(token, route, { method = 'GET', body = null } = {}) {
  const res = await fetch(BASE + route, {
    method,
    body: body ? JSON.stringify(body) : null,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
  });
  if (!res.ok) {
    let detalle = '';
    try { const e = await res.json(); detalle = (e && (e.error_description || e.error || e.Message)) ? ' — ' + String(e.error_description || e.error || e.Message) : ''; }
    catch (_) { /* sin cuerpo legible */ }
    throw Object.assign(new Error(`HTTP ${res.status} en ${route}${detalle}`), { status: res.status });
  }
  return res.json();
}

// abreviaturas del backend vs. códigos del txt del inspector: "Tres Febrero" lo abrevia como "3F"
// (TFCA del prototipo es banda "3FCA (3FEBRERO-CASINO)" en ROSBUS; análogos para CATF/TFFL/FLTF)
const ALIAS_DE_BANDA = { TFCA: '3FCA', CATF: 'CA3F', TFFL: '3FFL', FLTF: 'FL3F', NS: 'NS46', NN: 'NN46', RS: 'RS46', RN: 'RN46' };

/* Banderas extra por corredor (T35, pedido del inspector 28/10): servicios que el backend
 * lleva en una bandera aparte pero con el MISMO span de sectores que la banda principal del
 * lado (verificado con dto: LACA = 12 dins idénticos a GBCA; CALA = 13 idénticos a CAGB).
 * Se piden después de la banda principal y sus Items se FUSIONAN en el dto del lado;
 * cada Item conserva su Bandera (LACA/CALA) y el panel del prototipo la muestra por fila. */
const EXTRA_BANDERAS = {
  '143-GBCA-CAGB': { ida: ['LACA'], vuelta: ['CALA'] },
};

const log = m => console.log(m);
const die = (m, code) => { console.error('✖ ' + m); process.exit(code); };

(async () => {
  const creds = leerCredenciales();

  // 1) login
  let token = null;
  try {
    const r = await api(null, '/api/Auth/loginMobile', { method: 'POST', body: { username: creds.user, password: creds.pass, captchaValue: '' } });
    token = r && r.token;
  } catch (e) { die(`login falló (${e.message})`, 1); }
  if (!token) die('login sin token (¿captcha requerido?)', 1);
  log(`✔ login OK (token recibido, ${FECHA})`);

  // 2) líneas del usuario
  let lineas;
  try { lineas = (await api(token, '/Linea/GetLineasPorUsuario')).DataObject || []; }
  catch (e) { die('GetLineasPorUsuario falló: ' + e.message, 1); }

  const sentidoPorLinea = {}; // lineaId -> [{Id, Description}]
  const banderasPorLineaSentido = {}; // `${lineaId}:${sentidoId}` -> [{Id, Description}]

  for (const num of LINEAS_OBJETIVO) {
    const ln = lineas.find(l => norm(l.Description).startsWith(norm(String(num))) || norm(l.Description).includes('L' + num));
    if (!ln) { log(`⚠ línea ${num} no aparece en GetLineasPorUsuario`); continue; }
    log(`línea ${num} → id ${ln.Id} (${ln.Description})`);

    const sentidos = ((await api(token, `/SentidoBandera/GetItemsAsync?LineaId=${ln.Id}`)).DataObject) || [];
    sentidoPorLinea[ln.Id] = sentidos;
    log(`  sentidos: ${sentidos.map(s => `${s.Id}:${s.Description}`).join(', ') || '(vacío)'}`);

    for (const s of sentidos) {
      let bs = [];
      try {
        bs = ((await api(token, `/Bandera/RecuperarLineasActivasPorFecha?SentidoBanderaId=${s.Id}&LineaId=${ln.Id}&Fecha=${FECHA}`)).DataObject) || [];
      } catch (e) { log(`  ⚠ banderas sentido ${s.Id} falló: ${e.message}`); }
      banderasPorLineaSentido[`${ln.Id}:${s.Id}`] = bs;
      log(`  sentido ${s.Id} (${s.Description}): ${bs.length} banderas`);
    }
  }

  // 3) corredores del prototipo → match de banda por nombre en el sentido correcto
  const corrs = JSON.parse(fs.readFileSync(path.join(__dirname, 'corredores-unificados.json'), 'utf8'));
  const salida = {}; let ok = 0, fail = 0;

  for (const ln of corrs.lineas) {
    for (const c of ln.corredores) {
      // líneas compuestas ('133/125'): el corredor puede tener sus banderas bajo cualquiera de las líneas del backend
      const nums = String(ln.linea).includes('/') ? ln.linea.split('/').map(n => parseInt(n, 10)) : [parseInt(ln.linea, 10)];
      const lnObjs = nums.map(n => lineas.find(l => norm(l.Description).startsWith(norm(String(n))))).filter(Boolean);
      if (!lnObjs.length) { log(`⚠ ${c.id}: líneas ${nums.join('/')} no disponibles, se omite`); fail++; continue; }
      const paresLS = lnObjs.flatMap(o => (sentidoPorLinea[o.Id] || []).map(s => [o, s])); // [líneaObj, sentido]
      const dto = {};

      for (const lado of ['ida', 'vuelta']) {
        const nombre = c.banderas[lado];
        let hallado = null, sentido = null, lnId = null;
        for (const [o, s] of paresLS) {
          const bs = banderasPorLineaSentido[`${o.Id}:${s.Id}`] || [];
          // Description = "<CODIGO> (detalle...)"; el código inicial es el identificador de banda
          // (con alias: el backend puede abreviar el código del inspector, p. ej. TFCA → 3FCA)
          const claves = [norm(nombre), ALIAS_DE_BANDA[norm(nombre)]].filter(Boolean);
          const b = bs.find(x => claves.includes(norm(String(x.Description).split(/[\s(]/)[0])));
          if (b) { hallado = b; sentido = s; lnId = o.Id; break; }
        }
        if (!hallado) {
          const cand = paresLS.map(([o, s]) => (banderasPorLineaSentido[`${o.Id}:${s.Id}`] || []).map(x => x.Description)).flat().join(', ');
          log(`⚠ ${c.id} ${lado}: banda "${nombre}" no encontrada (candidatas: ${cand})`);
        } else {
          log(`${c.id} ${lado} → "${nombre}" = banda ${hallado.Id} (línea ${lnId}, sentido ${sentido.Id} ${sentido.Description})`);
          try {
            const filtro = { SentidoBanderaId: sentido.Id, LineaId: lnId, BanderasSeleccionadas: [hallado.Id], Fecha: FECHA };
            const r = await api(token, '/Bandera/RecuperarHorariosSectorPorSector', { method: 'POST', body: filtro });
            dto[lado] = r.DataObject || null;
            const filas = dto[lado] && dto[lado].Items ? dto[lado].Items.length : 0;
            log(`  ✔ horarios: ${filas} servicios`);
          } catch (e) { log(`  ⚠ horarios falló: ${e.message}`); dto[lado] = null; }
        }

        // banderas extra del lado (T35): mismo span que la principal; los Items se fusionan
        // aunque la banda principal no haya traído datos (dto[lado] null → se arma con extras)
        const extras = EXTRA_BANDERAS[c.id] && EXTRA_BANDERAS[c.id][lado];
        for (const code of (extras || [])) {
          const paresExtra = (hallado && sentido) ? [[lineas.find(l => l.Id === lnId), sentido]] : paresLS;
          let found = null;
          for (const [o, s] of paresExtra) {
            const bs = banderasPorLineaSentido[`${o.Id}:${s.Id}`] || [];
            const b = bs.find(x => norm(String(x.Description).split(/[\s(]/)[0]) === norm(code));
            if (b) { found = { b, s, ln: o.Id }; break; }
          }
          if (!found) { log(`  ⚠ extra "${code}" no encontrada este día (sus tramos no se traen)`); continue; }
          try {
            const r = await api(token, '/Bandera/RecuperarHorariosSectorPorSector', { method: 'POST',
              body: { SentidoBanderaId: found.s.Id, LineaId: found.ln, BanderasSeleccionadas: [found.b.Id], Fecha: FECHA } });
            const items = (r.DataObject && r.DataObject.Items) || [];
            if (!dto[lado]) dto[lado] = { Items: [] };
            dto[lado].Items = (dto[lado].Items || []).concat(items);
            log(`  ✔ extra "${code}": ${items.length} servicios (fusionados en ${lado})`);
          } catch (e) { log(`  ⚠ extra "${code}" falló: ${e.message}`); }
        }
      }
      salida[c.id] = dto;
      if (dto.ida || dto.vuelta) ok++; else fail++;
    }
  }

  fs.writeFileSync(SALIDA, JSON.stringify(salida, null, 1));
  log(`\n✔ ${SALIDA} generado (fecha ${FECHA}): ${ok} corredor(es) con datos, ${fail} sin datos`);
})().catch(e => die('inesperado: ' + e.message, 9));
