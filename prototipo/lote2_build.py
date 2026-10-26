#!/usr/bin/env python3
"""Lote 2/3 builder: parse sectores.txt completo (lote 1 + lote 2 + lote 3), derive ida/vuelta fusion,
merge into prototipo/corredores-unificados.json as draft with honest confianza.
Run:  REVIEW=1 python3 lote2_build.py   (review only: no file writes)
"""
import json, re, sys, os, unicodedata
from collections import defaultdict

SRC = '/mnt/d/insp-rb/sectores.txt'
OUT = '/mnt/d/insp-rb/prototipo/corredores-unificados.json'
REVIEW = os.environ.get('REVIEW') == '1'

def norm(t):
    t = unicodedata.normalize('NFD', t)
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return t.upper().strip()

def parts(t):
    t = t.replace(' e ', ' y ')
    ps = [p.strip().strip(',.').strip() for p in t.split(' y ')]
    return [p for p in ps if p]

def canon(t):
    return tuple(sorted(norm(p) for p in parts(t)))

def toks(t):
    return set(canon(t))

# ---------------- alineación de ejes de una misma línea (T27, 2026-10-25) ----------------
# Filas fantasma 'sector-oculto': compensan el descalce de fila entre los DOS ejes de un
# par de corredores de la misma línea (p.ej. 103-GBVG-VGGB de 16 filas vs 103-RUVG-VGRU de 13).
# Cada inserción se declara como (ancla, cantidad): se insertan N ocultos DESPUÉS del sector
# ancla, en la lista normalizada top-down del lado (la vuelta se tomarev = B[::-1], o sea los
# anchors se expresan en el MISMO orden top-down que la ida). El lado opuesto lleva los
# ocultos en las posiciones espejo: la fila fantasma empareja ida↔vuelta al mismo y.
# Los ocultos no son sectores reales: sin nombre, sin badge, excluidos de las corridas
# (la invariante ColumnasDinamicas = marcas(lado)-2 queda intacta quien filtramos los ocultos).
# T30 (inspector, 2026-10-25): inversión de lectura para 8 corredores — puntas
# invertidas, orden de sectores invertido y cambio de lateral (la regla del lienzo
# no cambia: ida siempre baja arriba-a-abajo en el lateral izquierdo, vuelta sube
# abajo-a-arriba en el derecho). La transformación se aplica SOBRE el eje ya
# armado (trailing transform): las tablas PATRON_*/VALIDACIONES/OCULTOS y los
# anclajes siguen expresados en la orientación vieja y no requieren retoques.
# El color no se re-deriva tras el renombre: hereda el del id viejo (identidad
# visual estable durante el cambio de nombre).
# T30b (inspector, 2.ª ronda 2026-10-25): mismas reglas para 128 y 143 — puntas,
# orden de sectores y lateral invertidos + renombre. La transformación sigue al
# final de derive() y las tablas siguen en la orientación vieja.
INVERTIR_LECTURA = {
    '126-LACE-CELA': '126-CELA-LACE',
    '126-OVCE-CEOV': '126-CEOV-OVCE',
    '130-ACCE-ROAC': '130-ROAC-ACCE',
    '133/125-OCFU-FUCO': '133/125-FUCO-OCFU',
    '133/125-OCWI-WICO': '133/125-WICO-OCWI',
    '142-NNFU-NSFU': '142-NSFU-NNFU',
    '142-RN-RS': '142-RS-RN',
    '102/144-NNBO-BONS': '102/144-BONS-NNBO',
    # 2.ª ronda (T30b)
    '128-NECE-NEAS': '128-NEAS-NECE',
    '128-ROCE-ROFR': '128-ROFR-ROCE',
    '143-CAGB-GBCA': '143-GBCA-CAGB',
    '143-CARU-RUCA': '143-RUCA-CARU',
}

OCULTOS_ALINEACION = {
    '103-RUVG-VGRU': {
        # GBVG-VGGB tiene 4 filas previas al tronco (Brown, Belgrano y Ruta11,
        # Ruta11 y Ciudadela, Rondeau y Puccio) vs 2 de RUVG: +2 pre-Sorrento hace que
        # Sorrento y Rondeau caiga en fila 5 en ambos ejes; +1 entre Arijón y
        # SMartín y ArroyoSaladillo alinea Cementerio VGG en fila 16 en ambos.
        'ida':    [('Baigorria y CCasas', 2), ('SMartín y Arijón', 1)],
        'vuelta': [('CCasas y Baigorria', 2), ('SMartín y Arijón', 1)],
    },
    # 122-SECE-CESE (confirmado 2026-10-25): RICE-CERI tiene 3 filas previas al tronco
    # (Riobamba y Brasil, PUnidas y 27Febrero, PUnidas y PPerón) vs 2 de SECE-CESE
    # (Segui y Circunvalación, Rouillón y Segui): +1 hace que PPerón y Matienzo caiga
    # en fila 4 y todo el tronco (PPerón y Avellaneda ... Ayacucho y MPolo fila 15)
    # alinee en ambos ejes, ida y vuelta.
    '122-SECE-CESE': {
        'ida':    [('Rouillón y Segui', 1)],
        'vuelta': [('Rouillón y Segui', 1)],
    },
    # 142 (confirmado por el inspector 2026-10-25, dos decisiones):
    # a) RN-RS tiene 5 filas previas al tronco (Cementerio VGG, Filippini y Mosconi,
    #    JDPerón y SMartín, SanDiego y 17OCtubre, SEstero y JDPerón) vs 2 de NNFU
    #    (SanDiego y JDPerón, JDPerón y SEstero): +3 hace que JDPerón y ArroyoSaladillo
    #    caiga en fila 6 en ambos ejes (ida y vuelta) y alinee el tronco hasta
    #    Mendoza y Donado (fila 20).
    # b) La cola difiere: NNFU termina en MdelPlata y Ruta9 (8 filas post-tronco) vs
    #    RN en Rucci (6 filas): +2 en RN-RS tras 'Baigorria y Circu' (es decir, entre
    #    'Circu y Colectora' y 'Baigorria y Circu' en el viaje físico) iguala las
    #    alturas: Rucci y MdelPlata y Ruta9 caen en fila 28 en ambos ejes.
    # íd: los ida van ANTES de 'JDPerón y SEstero' (tras 'SanDiego y JDPerón') para que
    # SEstero y JDPerónboth caigan en fila 5 como en RN-RS; vu van DESPUÉS de SEstero en el
    # viaje físico (entre SEstero y SanDiego y JDPerón), que en filas top-down = antes de
    # SEstero: filas 2,3,4 fantasma en ambos lados.
    '142-NNFU-NSFU': {
        'ida':    [('SanDiego y JDPerón', 3)],
        'vuelta': [('JDPerón y SEstero', 3)],
    },
    # 142-RN-RS: AJUSTE del inspector (2026-10-25, edición manual adoptada como regla):
    # los 2 ocultos de la cola van pegados tras 'JNewbery y JPabloII' (filas 25-26), no
    # tras 'Baigorria y Circu' (filas 26-27): 'Baigorria y Circu' queda en fila 27, a un
    # salto de Rucci (fila 28), espejando la proximidad visual del cierre del eje.
    # En el viaje físico de vuelta (Rucci→Cementerio) equivale a insertar tras 'Rucci'.
    '142-RN-RS': {
        'ida':    [('JNewbery y JPabloII', 2)],
        'vuelta': [('Rucci', 2)],
    },
}

def _aplicarOcultos(lista, specs, cid, lado):
    if not specs:
        return lista
    L = list(lista)
    for anchor, cnt in specs:
        hits = [i for i, t in enumerate(L) if norm(t) == norm(anchor)]
        assert hits, ('ocultos: ancla inexistente', cid, lado, anchor)
        k = hits[-1]
        L[k+1:k+1] = ['sector-oculto'] * cnt
    return L

# ---------------- parse ----------------
src = open(SRC).read().splitlines()
seg = src   # archivo completo: lote 1 (1..28) + lote 2 (29..72) + lote 3 (73.., agregado 2026-10-23)

blocks = []   # {linea, code, dir, list}
pairlines = []  # (block_index_of_vuelta, ida_txt, vuelta_txt)
sololines = []  # (block_index_of_vuelta, dir_txt, sector_txt) — 'Sin emparejar (dir): X'
i = 0
for ln in seg:
    s = ln.strip()
    if not s:
        continue
    mS = re.match(r'^Sin emparejar \(([^)]*)\)\s*:\s*(.+?)\.?\s*$', s)
    if mS:
        sololines.append((len(blocks), mS.group(1).strip(), mS.group(2).rstrip('.').strip()))
        continue
    if s.startswith('Emparejados:'):
        m = [x.strip().rstrip('.') for x in s[len('Emparejados:'):].split(',', 1)]
        pairlines.append((len(blocks), m[0], m[1]))
        continue
    m = re.match(r'^(\d+(?:/\d+)?)\s+([A-Z]+)(?:\s*\(\+[^)]*\))?\s*\(([^)]*)\)\s*:?\s*(.*)$', s)
    if m:
        rest = m.group(4)
        lst = [p for p in (x.strip().strip('.,').strip() for x in rest.split(',')) if p]
        blocks.append({'linea': m.group(1), 'code': m.group(2), 'dir': m.group(3), 'list': lst})
        continue
    if blocks and not blocks[-1]['list']:   # lote 1: lista multilínea debajo del encabezado
        lst = [p for p in (x.strip().strip('.,').strip() for x in s.split(',')) if p]
        blocks[-1]['list'] = lst

# ---------------- corridors: consecutive block pairs ----------------
corr = []
i = 0
while i + 1 < len(blocks):
    a, b = blocks[i], blocks[i + 1]
    assert a['linea'] == b['linea'], (a['code'], b['code'])
    c = {'linea': a['linea'], 'ida': a, 'vuelta': b, 'explicit': [], 'soloI': [], 'soloV': []}
    i += 2
    # attach explicit pair lines that follow this pair's blocks
    ci = len(corr)
    corr.append(c)
for (bi, dtxt, stxt) in sololines:
    vb = blocks[bi - 1]
    cand = [k for k, c in enumerate(corr) if c['vuelta']['code'] == vb['code'] and c['vuelta']['linea'] == vb['linea']]
    assert cand, (bi, dtxt, stxt)
    c = corr[cand[0]]
    if dtxt == c['ida']['dir'].strip():
        c['soloI'].append(stxt)
    elif dtxt == c['vuelta']['dir'].strip():
        c['soloV'].append(stxt)
    else:
        raise AssertionError(('Sin emparejar con lado no reconocido', bi, dtxt, stxt, c['ida']['dir'], c['vuelta']['dir']))

for (bi, at, bt) in pairlines:
    # bi was len(blocks) when the line was seen -> the block index of the vuelta block is bi-1
    cand = [k for k, c in enumerate(corr) if c['vuelta']['code'] == blocks[bi - 1]['code'] and c['vuelta']['linea'] == blocks[bi - 1]['linea']]
    assert cand, (bi, at, bt)
    corr[cand[0]]['explicit'].append((at, bt))

assert len(corr) == 26, f'corridors parsed: {len(corr)}'   # 17 (lote 1+2) + 9 (lote 3)

COLORS = {
    # espejo del const COLORS de index.html (fuente de verdad = index.html)
    '122-RICE-CERI': '#ef6c00', '122-SECE-CESE': '#ffb300',
    '126-LACE-CELA': '#ba68c8', '126-OVCE-CEOV': '#880e4f',
    '128-NECE-NEAS': '#8e24aa', '128-ROCE-ROFR': '#c2185b',
    '130-ACCE-ROAC': '#ba68c8',
    '133/125-OCFU-FUCO': '#5d4037', '133/125-OCWI-WICO': '#8d6e63',
    '138/139-TFCA-CATF': '#64b5f6', '140-TFFL-FLTF': '#1565c0',
    # lote 3 (borrador 2026-10-23; hexes provisionales, la paleta final la define el inspector).
    # ids derivados del parseo: primer ramal listado = ida (142 NNFU va primero; 145/133 y 102/144 son compuestas)
    '142-NNFU-NSFU': '#455a64', '142-RN-RS': '#00695c',
    '143-CAGB-GBCA': '#0277bd', '143-CARU-RUCA': '#00897b',
    '102/144-NNBO-BONS': '#039be5',
    '145/133-CACE-CECA': '#ff7043', '145/133-SOCE-CESO': '#607d8b',
    '146-NS-NN': '#5c6bc0', '146-RS-RN': '#afb42b',
}

# ---------------- validaciones del inspector (ronda 2026-10-22) ----------------
# Los corredores con reglas se derivan por MAPA EXPLÍCITO: pares confirmados por
# el inspector + compartidos por esquina idéntica + solos; cada sector debe quedar
# contabilizado exactamente una vez (asserts de cobertura en derive()).
EXPLICITA = {'tipo': 'emparejado', 'confianza': 'exacta', 'criterio': 'par explícito dado por el inspector (ronda 2026-10-22)', 'validada': True}
SOLO = {'criterio': 'queda solo (confirmado por el inspector 2026-10-22)', 'validada': True}

def OKP(conf):
    """Par que sostenía el heurístico y el inspector dio el OK (conserva confianza)."""
    return {'tipo': 'emparejado', 'confianza': conf, 'validada': True}

def OKPC(conf):
    """OKP + criterio explícito (el inspector revisó y confirmó el par del heurístico)."""
    return dict(OKP(conf), criterio='par del heurístico revisado y correcto (inspector, ronda 2026-10-22)')


# 122: patrón del tramo central (compartido por ambos ramales), ronda 2026-10-22.
PATRON_122 = [
    ('SNicolás y Pellegrini', 'Cafferata y Montevideo', EXPLICITA),
    ('SLorenzo y EntreRíos', 'SantaFe y SMartín', EXPLICITA),
    ('Laprida y Rioja', None, SOLO),
    ('Córdoba y Cafferata', 'SantaFe y Cafferata', OKP('inferida-media')),
    ('Córdoba y Oroño', 'SantaFe y Oroño', OKP('inferida-media')),
    ('Colón y 27Febrero', 'Necochea y 27Febrero',
     {'tipo': 'emparejado', 'confianza': 'inferida-alta', 'validada': True,
      'criterio': 'misma calle 27FEBRERO; validado por el inspector (Necochea cambia su nomenclatura a Pavón)'}),
    ('Necochea y Uriburu', 'Pavón y Uriburu',
     {'tipo': 'emparejado', 'confianza': 'inferida-alta', 'validada': True,
      'criterio': 'misma calle URIBURU; validado por el inspector (Necochea cambia su nomenclatura a Pavón)'}),
]

# 133/125: ronda 2026-10-22 (troncal compartida entre OCFU/FUCO y OCWI/WICO).
PATRON_133 = [
    ('Segui y Barra', 'Garzón y Segui', OKP('inferida-media')),
    ('Segui y Aldao', None, SOLO),
    ('PPerón y FMoré', '27Febrero y Matienzo', EXPLICITA),
    ('PPerón y Cafferata', 'SNicolás y PPerón', EXPLICITA),
    ('Francia y Cerrito', 'OLagos y Viamonte', EXPLICITA),
    ('Montevideo y Oroño', 'Balcarce y Pellegrini', EXPLICITA),
    (None, 'Montevideo y OLagos', SOLO),
    ('Moreno y San Luis', 'SJuan y Balcarce', EXPLICITA),
    ('Corrientes y SantaFe', 'SLorenzo y EntreRíos', EXPLICITA),
    ('SantaFe y Oroño', 'SLorenzo y Oroño', OKP('inferida-media')),
    ('SantaFe y Francia', 'Córdoba y Francia', OKP('inferida-media')),
    ('SantaFe y Avellaneda', 'Córdoba y Avellaneda', OKP('inferida-media')),
    ('SantaFe y Agneta', 'Córdoba y Agneta', OKP('inferida-media')),
]

# Lote 1 (101, 103, 107, 110): pares del heurístico revisados y correctos por el
# inspector (2026-10-22), solos confirmados incluidos. Generado desde el estado
# anterior del JSON para cubrir TODO el eje (asserts de cobertura).
PATRON_103_TRAMO = [
        ('Salta y Cafferata', 'Catamarca y Cafferata', OKPC('exacta')),
        ('Salta y Oroño', 'Catamarca y Oroño', OKPC('inferida-alta')),
        ('Paraguay y SantaFe', 'Catamarca y Paraguay', OKPC('inferida-media')),
        ('Paraguay y Pellegrini', 'Corrientes y Mendoza', OKPC('inferida-baja')),
        ('Paraguay y 27Febrero', '27Febrero y Corrientes', OKPC('inferida-alta')),
]
PATRON_107_RIO = [
        ('VDParque y Levi', 'Calderón y Levi', OKPC('inferida-media')),
        ('Superí y Rondeau', 'Rondeau y Baigorria', OKPC('inferida-media')),
        ('Alberdi y Avellaneda', 'Alberdi y Casilda', OKPC('inferida-media')),
        ('Avellaneda y SLorenzo', 'SantaFe y Avellaneda', OKPC('inferida-media')),
        (None, 'SantaFe y Cafferata', SOLO),
        ('SLorenzo y Oroño', 'SantaFe y Oroño', OKPC('inferida-alta')),
        ('SLorenzo y EntreRios', 'Corrientes y SantaFe', OKPC('inferida-alta')),
        ('EntreRios y Pellegrini', 'Corrientes y Pellegrini', OKPC('inferida-alta')),
        ('EntreRios y Amenábar', 'Corrientes y Amenábar', OKPC('inferida-alta')),
]
VALIDACIONES_INSPECTOR = {
    '122-RICE-CERI': PATRON_122,
    '122-SECE-CESE': PATRON_122 + [
        ('PPerón y Matienzo', 'Matienzo y Gálvez', OKP('inferida-alta')),
    ],
    '126-LACE-CELA': [
        (None, 'OLagos y 27Febrero', SOLO),
        (None, 'TFebrero y Mitre', SOLO),
        ('SLorenzo e Italia', None, SOLO),
    ],
    '126-OVCE-CEOV': [
        (None, 'OLagos y 27Febrero', SOLO),
        (None, 'TFebrero y Mitre', SOLO),
        ('SLorenzo e Italia', None, SOLO),
    ],
    '130-ACCE-ROAC': [
        ('Italia y 27Febrero', None, SOLO),
        (None, 'SJuan y Dorrego', SOLO),
        (None, 'Laprida y Rioja', SOLO),
    ],
    '128-NECE-NEAS': [
        ('SantaFe y Avellaneda', 'Avellaneda y Córdoba', EXPLICITA),
        ('Avellaneda y Cerrito', 'Avellaneda y Montevideo', EXPLICITA),
        ('Avellaneda y Uruguay', 'Avellaneda y DeanFunes', EXPLICITA),
        ('Biedma y OLagos', 'Segui y OLagos', EXPLICITA),
        ('Mitre y Ayolas', 'EntreRios y Ayolas', EXPLICITA),
        ('Mitre y Pellegrini', 'EntreRios y Pellegrini', EXPLICITA),
        ('Mitre y SLuis', 'SJuan y EntreRios', EXPLICITA),
    ],
    '128-ROCE-ROFR': [
        ('Cafferata y Córdoba', None, SOLO),
        ('Cafferata y Montevideo', 'SNicolás y Zeballos', EXPLICITA),
        ('Cafferata y Saavedra', 'SNicolás y Garay', EXPLICITA),
        ('Biedma y OLagos', 'Segui y OLagos', OKP('inferida-alta')),
        ('Mitre y Ayolas', 'EntreRios y Ayolas', OKP('inferida-alta')),
        ('Mitre y Pellegrini', 'EntreRios y Pellegrini', OKP('inferida-alta')),
        ('Mitre y SLuis', None, SOLO),
        (None, 'SJuan y EntreRios', SOLO),
    ],
    '138/139-TFCA-CATF': [
        ('SLuis y Avellaneda', 'Rioja y Avellaneda', OKP('inferida-alta')),
        ('SLuis y Francia', 'SantaFe y Cafferata', EXPLICITA),
        ('SLuis y Oroño', 'SJuan y Oroño', EXPLICITA),
        ('SLuis y EntreRíos', 'SJuan y EntreRíos', EXPLICITA),
        ('Laprida y Pellegrini', 'BsAires y Pellegrini', EXPLICITA),
        ('27Febrero y Laprida', 'PJunta y 27Febrero', EXPLICITA),
        ('Balcarce y Arijón', 'Oroño y Arijón', EXPLICITA),
    ],
    '140-TFFL-FLTF': [
        ('SLorenzo y Laprida', 'Maipú y SantaFe', EXPLICITA),
        ('Avellaneda y NJulio', 'TFebrero y Avellaneda', OKP('inferida-media')),
        ('NJulio y Francia', 'TFebrero y Francia', OKP('inferida-media')),
        ('NJulio y Alvear', None, SOLO),
        ('SLorenzo y Oroño', 'SantaFe y Oroño', OKP('inferida-alta')),
        ('Laprida y Pellegrini', 'Maipú y Pellegrini', OKP('inferida-media')),
        ('Sarmiento y 27Febrero', 'Mitre y 27Febrero', OKP('inferida-media')),
        ('Sarmiento y Segui', 'SMartín y Segui', OKP('inferida-media')),
    ],
    '133/125-OCFU-FUCO': PATRON_133,
    '133/125-OCWI-WICO': PATRON_133 + [
        ('Navarro y Wilde', 'Wilde y Benegas', OKP('inferida-alta')),
    ],
    '101-CEPO-POCE': [
        ('PUnidas y Pellegrini', None, SOLO),
        ('PUnidas y Córdoba', 'PUnidas y Mendoza', OKPC('inferida-alta')),
        ('Sabín y Avellaneda', 'Avellaneda y Casilda', OKPC('inferida-media')),
        ('Tucumán y Francia', 'SantaFe y VMujica', OKPC('inferida-baja')),
        ('SLorenzo y Oroño', 'SantaFe y Oroño', OKPC('inferida-alta')),
        ('Laprida y Rioja', 'SantaFe y Corrientes', OKPC('inferida-baja')),
        ('Laprida y Montevideo', 'Maipú y 9Julio', OKPC('inferida-baja')),
        ('Pellegrini y Alem', 'Ayacucho y Pellegrini', OKPC('inferida-alta')),
    ],
    '103-GBVG-VGGB': [
        ('Belgrano y Ruta11', None, SOLO),
        ('Rondeau y Puccio', None, SOLO),
        *PATRON_103_TRAMO,
    ],
    '103-RUVG-VGRU': PATRON_103_TRAMO,
    '107-LIFO-FOLI': [
        *PATRON_107_RIO,
        ('EntreRios y Uriburu', 'Uriburu y Corrientes', OKPC('inferida-media')),
        ('Uriburu y Necochea', 'Pavón y Uriburu', OKPC('inferida-media')),
    ],
    '107-LIFA-FALI': [
        *PATRON_107_RIO,
        ('Amenábar y Colón', 'Necochea y Gaboto', OKPC('inferida-alta')),
        ('Necochea y Uriburu', 'Pavón y Uriburu', OKPC('inferida-alta')),
    ],
    '110-NS-NN': [
        ('JIngenieros y Alberdi', 'Génova y Antelo', OKPC('inferida-baja')),
        ('JIngenieros y Avellaneda', 'Avellaneda y Génova', OKPC('inferida-alta')),
        ('Junín y Thedy', 'Thedy y VSarsfield', OKPC('inferida-alta')),
        ('OLagos y Güemes', None, SOLO),
        ('SLorenzo y Moreno', 'Urquiza y Oroño', OKPC('inferida-alta')),
        ('SLorenzo y Sarmiento', 'SantaFe y SMartín', OKPC('inferida-alta')),
        ('Laprida y Pellegrini', 'Maipú y 9Julio', OKPC('inferida-baja')),
        ('Sarmiento y 27Febrero', 'Ocampo y Maipú', OKPC('inferida-baja')),
        ('27Febrero y Balcarce', 'Pueyrredón y Virasoro', OKPC('inferida-baja')),
        ('JCura y OLagos', 'OLagos y Segui', OKPC('inferida-media')),
        ('Segui y Lavalle', 'Segui y Valparaíso', OKPC('inferida-media')),
        ('Segui y Rouillón', None, SOLO),
    ],
}


# ---------------- derivation ----------------
def derive(c, cid=None, lote=2):
    soloI = {}; soloV = {}
    # hints 'Sin emparejar (dir): X' del txt del inspector (lote 3, 2026-10-23)
    for t in c['soloI']:
        soloI.setdefault(t, {'criterio': 'queda solo (declarado por el inspector en sectores.txt)', 'validada': True})
    for t in c['soloV']:
        soloV.setdefault(t, {'criterio': 'queda solo (declarado por el inspector en sectores.txt)', 'validada': True})
    cid = cid or f"{c['linea']}-{c['ida']['code']}-{c['vuelta']['code']}"
    specH = OCULTOS_ALINEACION.get(cid)
    A = _aplicarOcultos(c['ida']['list'], specH and specH.get('ida'), cid, 'ida')
    B = _aplicarOcultos(c['vuelta']['list'], specH and specH.get('vuelta'), cid, 'vuelta')
    rev = B[::-1]                     # top-down
    nA, nB = len(A), len(rev)
    matchA = {}   # i -> (j, tipo, conf, criterio, validada)
    matchB = {}

    # pass1: shared corner (same canonical corner, k-th occurrence to k-th)
    soloIh = {norm(t) for t in soloI}; soloVh = {norm(t) for t in soloV}
    posB = defaultdict(list)
    for j, txt in enumerate(rev):
        posB[canon(txt)].append(j)
    ptr = defaultdict(int)
    for i2, txt in enumerate(A):
        if norm(txt) in soloIh:
            continue
        c2 = canon(txt)
        while ptr[c2] < len(posB.get(c2, [])):
            j = posB[c2][ptr[c2]]; ptr[c2] += 1
            if norm(rev[j]) not in soloVh and j not in matchB:
                matchA[i2] = (j, 'compartido', 'exacta', None, False)
                matchB[j] = i2
                break

    # pass2: explicit user pairs
    exp = {}
    for (at, bt) in c['explicit']:
        exp.setdefault(canon(at), bt)
    for i2, txt in enumerate(A):
        if i2 in matchA or norm(txt) in soloIh:
            continue
        c2 = canon(txt)
        if c2 in exp and norm(exp[c2]) not in [None]: 
            want = norm(exp[c2])
            # find unmatched j with same normalized text
            cand = [j for j in range(nB) if j not in matchB and norm(rev[j]) == want]
            if cand:
                j = cand[0]
                matchA[i2] = (j, 'emparejado', 'exacta', 'par explícito dado por el usuario', True)
                matchB[j] = i2

    # pass3: global greedy token matching (bipartite, deterministic)
    cands = []
    for i2, at in enumerate(A):
        if i2 in matchA or norm(at) in soloIh:
            continue
        ta = toks(at)
        if not ta:
            continue
        for j, bt in enumerate(rev):
            if j in matchB or norm(rev[j]) in soloVh:
                continue
            sh = ta & toks(bt)
            if sh:
                dist = abs(i2 / max(nA - 1, 1) - j / max(nB - 1, 1))
                cands.append((-len(sh), dist, i2, j, '+'.join(sorted(sh))))
    cands.sort(key=lambda x: (x[0], x[1], x[2], x[3]))
    for (_, _, i2, j, sh) in cands:
        if i2 in matchA or j in matchB:
            continue
        dist = abs(i2 / max(nA - 1, 1) - j / max(nB - 1, 1))
        conf = 'inferida-alta' if dist <= 0.12 else ('inferida-media' if dist <= 0.25 else 'inferida-baja')
        # more than one plausible candidate sharing tokens near this region -> cap at media
        near = sum(1 for (_, _, k2, k3, shh) in cands if abs(k2 / max(nA - 1, 1) - i2 / max(nA - 1, 1)) < 0.12 and abs(k3/ max(nB - 1, 1) - j / max(nB - 1, 1)) < 0.12)
        if near > 1 and conf == 'inferida-alta':
            conf = 'inferida-media'
        matchA[i2] = (j, 'emparejado', conf, f'misma calle {sh} (heurística, validar inspector)', False)
        matchB[j] = i2

    # pass4: mapa explícito del inspector (reglas) — reconstruye matchA/matchB
    # desde cero cuando el corredor tiene reglas; cada sector queda cubierto
    # exactamente una vez (compartidos por esquina, pares confirmados, solos).
    reglas = VALIDACIONES_INSPECTOR.get(cid) or []
    pairsV = {}
    if reglas:
        for (a, b, camb) in reglas:
            if a and b: pairsV[a] = (b, camb)
            elif a: soloI[a] = camb
            elif b: soloV[b] = camb
        matchA, matchB = {}, {}
        posB = defaultdict(list)
        for j, txt in enumerate(rev):
            posB[canon(txt)].append(j)
        ptr = defaultdict(int)
        for i2, txt in enumerate(A):
            if norm(txt) in soloIh:
                continue
            c2 = canon(txt)
            while ptr[c2] < len(posB.get(c2, [])):
                j = posB[c2][ptr[c2]]; ptr[c2] += 1
                if norm(rev[j]) not in soloVh and j not in matchB:
                    matchA[i2] = (j, 'compartido', 'exacta', None, False); matchB[j] = i2
                    break
        exp = {}
        for (at, bt) in c['explicit']:
            exp.setdefault(canon(at), bt)
        for i2, txt in enumerate(A):
            if i2 in matchA or norm(txt) in soloIh: continue
            c2 = canon(txt)
            if c2 in exp:
                cand = [j for j in range(nB) if j not in matchB and norm(rev[j]) == norm(exp[c2])]
                if cand:
                    j = cand[0]
                    matchA[i2] = (j, 'emparejado', 'exacta', 'par explícito dado por el usuario', True)
                    matchB[j] = i2
        for a, (bs, camb) in pairsV.items():
            i = next(i2 for i2, t in enumerate(A) if t == a and i2 not in matchA)
            j = next(j for j, t in enumerate(rev) if norm(t) == norm(bs) and j not in matchB)
            dist = abs(i / max(nA - 1, 1) - j / max(nB - 1, 1))
            conf = camb.get('confianza') or ('inferida-alta' if dist <= 0.12 else ('inferida-media' if dist <= 0.25 else 'inferida-baja'))
            crit = camb.get('criterio')
            if not crit:
                sh = toks(a) & toks(bs)
                crit = 'misma calle ' + '+'.join(sorted(sh)) + ' (heurística, validar inspector)'
            matchA[i] = (j, camb.get('tipo') or 'emparejado', conf, crit, camb.get('validada', False))
            matchB[j] = i
        for i2, txt in enumerate(A):
            assert i2 in matchA or txt in soloI, ('sector ida sin destino', cid, txt)
        for j, txt in enumerate(rev):
            assert j in matchB or txt in soloV, ('sector vuelta sin destino', cid, txt)

    # build fused marks along ida order (orden = i+1 for ida entries)
    marks = []
    for i2, at in enumerate(A):
        crit = None; val = False
        if i2 in matchA:
            j, tipo, conf, crit, val = matchA[i2]
            m = {'orden': i2 + 1, 'tipo': tipo, 'confianza': conf, 'ida': at, 'vuelta': rev[j]}
        else:
            m = {'orden': i2 + 1, 'tipo': 'solo-ida', 'confianza': '-', 'ida': at, 'vuelta': None,
                 'criterio': 'sin sector correspondiente en la lista vuelta'}
            meta = soloI.get(at)
            if meta:
                if meta.get('criterio'): m['criterio'] = meta['criterio']
                if meta.get('validada'): m['validadaUsuario'] = True
        if crit: m['criterio'] = crit
        if val: m['validadaUsuario'] = True
        marks.append(m)

    # solo-vuelta: insert with fractional orden by vuelta position between paired anchors
    gaps = defaultdict(int)
    unmatchedB = [j for j in range(nB) if j not in matchB]
    matchedBsorted = sorted(matchB.keys())
    for j in unmatchedB:
        above = [k for k in matchedBsorted if k < j]
        below = [k for k in matchedBsorted if k > j]
        if above and below:
            ka, kb = above[-1], below[0]
            pa = matchB[ka] + 1   # orden of the anchor mark (A index + 1)
            pb = matchB[kb] + 1
            r = (j - ka) / (kb - ka)
            base = pa + (pb - pa) * r
            gaps[(ka, kb)] += 1
            step = (pb - pa) * 0.05 * gaps[(ka, kb)]
            orden = round(min(base + step, pb - 0.05), 3)
        elif below:   # above the top mark
            kb = below[0]
            pb = matchB[kb] + 1
            gaps[('top', kb)] += 1
            orden = round(pb - 0.5 - 0.1 * (gaps[('top', kb)] - 1) - 0.05, 3)
        else:         # below the bottom mark
            ka = above[-1]
            pa = matchB[ka] + 1
            gaps[('bot', ka)] += 1
            orden = round(pa + 0.5 + 0.1 * (gaps[('bot', ka)] - 1) + 0.05, 3)
        sv = {'orden': orden, 'tipo': 'solo-vuelta', 'confianza': '-', 'ida': None, 'vuelta': rev[j],
              'criterio': 'sin sector correspondiente en la lista ida'}
        meta = soloV.get(rev[j])
        if meta:
            if meta.get('criterio'): sv['criterio'] = meta['criterio']
            if meta.get('validada'): sv['validadaUsuario'] = True
        marks.append(sv)

    # filas fantasma de alineación: pasan a tipo 'oculto' (excluidas de corridas y buscador)
    for m in marks:
        if m['ida'] == 'sector-oculto' or m['vuelta'] == 'sector-oculto':
            m['tipo'] = 'oculto'
            m['confianza'] = 'exacta'
            m['criterio'] = 'fila fantasma para alinear los ejes de una misma línea (comisión del inspector 2026-10-25, T27)'
            m['validadaUsuario'] = True
    marks.sort(key=lambda m: m['orden'])
    # renumber nothing; fractional ordens allowed (convención JSON)
    cov_ida = sum(1 for m in marks if m['ida']); cov_vuelta = sum(1 for m in marks if m['vuelta'])
    assert cov_ida == nA and cov_vuelta == nB, (c['ida']['code'], cov_ida, nA, cov_vuelta, nB)
    assert all(marks[k]['orden'] < marks[k+1]['orden'] for k in range(len(marks)-1)), 'orden must strictly ascend'

    cor = {
        'id': cid,
        'banderas': {'ida': c['ida']['code'], 'vuelta': c['vuelta']['code']},
        'puntaArriba': A[0], 'puntaAbajo': A[-1],
        'eje': marks,
        'color': COLORS.get(cid) or '#667788',
        'lote': lote,
        'notasRamales': [
            {'bandera': c['ida']['code'], 'rotuloUsuario': c['ida']['dir'], 'paisaje': 'primer bandera listada = ida (origen = puntaArriba)'},
            {'bandera': c['vuelta']['code'], 'rotuloUsuario': c['vuelta']['dir'], 'paisaje': 'segunda bandera listada = vuelta'},
        ],
    }
    # T30: inversión de lectura (ver mapa INVERTIR_LECTURA) aplicada al final de derive()
    nuevo = INVERTIR_LECTURA.get(cid)
    if nuevo:
        eje = []
        for m in reversed(cor['eje']):
            m2 = dict(m)
            m2['ida'], m2['vuelta'] = m['vuelta'], m['ida']
            if m2['tipo'] == 'solo-ida':    m2['tipo'] = 'solo-vuelta'
            elif m2['tipo'] == 'solo-vuelta': m2['tipo'] = 'solo-ida'
            eje.append(m2)
        for k, m in enumerate(eje, 1):
            m['orden'] = k
        cor = dict(cor)
        cor['eje'] = eje
        cor['puntaArriba'], cor['puntaAbajo'] = cor['puntaAbajo'], cor['puntaArriba']
        cor['banderas'] = {'ida': cor['banderas']['vuelta'], 'vuelta': cor['banderas']['ida']}
        cor['notasRamales'] = list(reversed(cor['notasRamales']))
        cor['id'] = nuevo   # el color NO se re-deriva: hereda el del id viejo (determinismo + identidad visual)
    return {'linea': c['linea'], 'corredores': [cor], '_c': c}

def compact(c):
    A, B = c['ida']['list'], c['vuelta']['list']
    cid = f"{c['linea']}-{c['ida']['code']}-{c['vuelta']['code']}"
    lines = [f"== {cid}: ida len {len(A)}, vuelta len {len(B)}"]
    lines.append(f"   labels: ida ({c['ida']['dir']}) / vuelta ({c['vuelta']['dir']})")
    cor = derive(c)
    for m in sorted(cor['corredores'][0]['eje'], key=lambda m: m['orden']):
        ida, vu = m['ida'] or '—', m['vuelta'] or '—'
        lines.append(f"  o={m['orden']:>6} {m['tipo']:<12} {m['confianza']:<14} ida={ida} | vuelta={vu}")
    return '\n'.join(lines)

if REVIEW:
    for c2 in corr:
        print(compact(c2))
    sys.exit(0)

# ---------------- merge ----------------
data = json.load(open(OUT))
newbyline = defaultdict(list)
LOT1 = {'101-CEPO-POCE','103-GBVG-VGGB','103-RUVG-VGRU','107-LIFO-FOLI','107-LIFA-FALI','110-NS-NN'}
existing_ids = {str(l['linea']): [cor['id'] for cor in l['corredores']] for l in data['lineas']}
lot1_seen = {}
for c2 in corr:
    k1 = str(c2['linea'])
    if k1 in ('101','103','107','110'):
        n = lot1_seen.get(k1, 0)          # orden de parseo == orden del JSON
        lot1_seen[k1] = n + 1
        ids = existing_ids[k1]
        assert n < len(ids), (k1, n)
        d = derive(c2, cid=ids[n])
        tgt = [cor for l in data['lineas'] for cor in l['corredores'] if cor['id'] == ids[n]]
        assert len(tgt) == 1, ids[n]
        tgt[0]['eje'] = d['corredores'][0]['eje']
        continue
    lote = 3 if str(c2['linea']) in ('142', '143', '102/144', '145/133', '146') else 2
    d = derive(c2, lote=lote)
    newbyline[d['linea']].append(d['corredores'][0])

order = ['101', '103', '107', '110', '122', '126', '128', '130', '133/125', '138/139', '140',
         '142', '143', '102/144', '145/133', '146']
existing = {str(l['linea']): l for l in data['lineas'] if str(l['linea']) not in set(order[4:])}
for k in existing:
    assert k in order, k
out_lineas = []
merged_lines = []
for ln in data['lineas']:
    lk = str(ln['linea'])
    if lk in existing:
        merged_lines.append((lk, existing[lk]))
for k in order[4:]:
    # lote 2 is ALWAYS re-derived from the source (idempotent with overrides)
    corlist = sorted(newbyline[k], key=lambda c: 0)  # keep parse order
    merged_lines.append((k, {'linea': k if '/' in k or not k.isdigit() else int(k), 'corredores': corlist}))
data['lineas'] = [obj for (k, obj) in merged_lines]
data['meta']['version'] = '7-prototipo-2026-10-26-t30-inversion-12-ejes'
data['meta']['correccionesUsuario'] = (
    '2026-10-21: ajustes de emparejamiento en 101, 107 y 110 (ver DISENO-CORREDORES-UNIFICADOS.md 4); '
    '2026-10-22: lote 2 agregado (122, 126, 128, 130, 133/125, 138/139, 140) desde sectores.txt; '
    'pares explícitos del usuario honrados verbatim (126 x8, 130 x4); '
    'ronda de validación 2026-10-22 COMPLETA: 17/17 corredores, 0 marcas sin validar '
    '(reglas en VALIDACIONES_INSPECTOR con helpers EXPLICITA/SOLO/OKP/OKPC); '
    'invariante dinámicas = marcas−2 verificado contra horarios reales, 2.375/2.375 filas exacto (0 descalces). '
    '2026-10-23: lote 3 agregado (142, 143, 102/144, 145/133, 146 — 9 corredores) desde sectores.txt: '
    'draft heurístico honesto PENDIENTE de validación del inspector (criterios "(heurística, validar inspector)"); '
    'pares explícitos "Emparejados" y solos "Sin emparejar (dir)" del txt honrados desde la primera derivación.'
)
data['meta']['orientacionEje'] = (
    '2026-10-25/26 (T30 + T30b): 12 corredores con lectura invertida por decisión del inspector '
    '(ronda 1: 126 x2, 130, 133/125 x2, 142 x2, 102/144; ronda 2: 128 x2, 143 x2 — puntas invertidas, '
    'orden de sectores invertido y cambio de lateral respetando el movimiento ida↓/vuelta↑); '
    'ejes verificados golden contra el eje previo invertido (reversed+swap idéntico, 12/12); '
    'horarios habiles/mediofestivo/festivo re-clavados con el mismo mapa (id nuevo + swap '
    'ida↔vuelta); fetch-horarios.js NO necesita cambios (lee ids/banderas del JSON en runtime). '
    'INDEX/diseño: §14. '
    'eje = orden de viaje del ida (descendiendo a la izquierda); vuelta sube a la derecha; '
    'puntaArriba = sector origen del ida; los rótulos direccionales del txt de lote 2/3 no son confiables '
    '(ver notasRamales por corredor); norte-arriba solo correres N-S del lote 1; '
    '145/133 usa ejes diagonales (Oeste-Sur / Sur-Oeste) según el txt.'
)
json.dump(data, open(OUT, 'w'), ensure_ascii=False, indent=2)
counts = []
for obj in data['lineas']:
    for cor in obj['corredores']:
        eje = cor['eje']
        counts.append((cor['id'], len(eje),
                       sum(1 for m in eje if m['ida']),
                       sum(1 for m in eje if m['vuelta'])))
print('corridor counts (id, marks, ida-covered, vuelta-covered):')
for cc in counts:
    print(' ', cc)
print('WROTE', OUT)



# ---------------- docs: estado final por línea/ramal (DISENO §10) ----------------
DOCO = '/mnt/d/insp-rb/prototipo/estado-emparejamientos.md'
md = ['# Emparejamientos finales por línea y ramal', '',
      '> Generado por lote2_build.py; NO editar a mano. Regenerar: `python3 prototipo/lote2_build.py`', '',
      'Tipos: compartido (misma esquina), emparejado (par por calle/clave), solo-ida / solo-vuelta.', '']
for obj in data['lineas']:
    corrs = obj['corredores']
    ramals = ' · '.join(cor['id'] for cor in corrs)
    md.append(f"## Línea {obj['linea']} — {ramals}")
    for cor in corrs:
        md.append('')
        md.append(f"### {cor['id']} ({cor.get('puntaArriba','')} → {cor.get('puntaAbajo','')})")
        md.append('')
        md.append('| # | tipo | confianza | ida (baja) | vuelta (sube) | validada |')
        md.append('|---|------|-----------|------------|---------------|----------|')
        for k, m in enumerate(cor['eje'], 1):
            md.append(f"| {k} | {m['tipo']} | {m['confianza']} | {m['ida'] or '—'} | {m['vuelta'] or '—'} | "
                      + ('✓' if m.get('validadaUsuario') else ''))
        md.append('')
open(DOCO, 'w').write('\n'.join(md).rstrip() + '\n')
print('WROTE', DOCO)
