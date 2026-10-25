#!/usr/bin/env python3
"""Extrae las plantillas HTML inlineadas (template:) de los bundles webpack de Ionic 3."""
import re, os, sys, glob, json

BUILD = "/storage/emulated/0/insp-rb/insp-rb-v1.0.20200115/assets/www/build"
OUT = "/storage/emulated/0/insp-rb/_analisis/plantillas"
os.makedirs(OUT, exist_ok=True)

def find_string(src, i):
    """Devuelve (texto, fin) del string JS que empieza en src[i] (comilla en i) o (None, i)."""
    q = src[i]
    if q not in "'\"`":
        return None, i
    out = []
    j = i + 1
    n = len(src)
    while j < n:
        c = src[j]
        if c == "\\":
            if j + 1 >= n:
                break
            e = src[j + 1]
            mapping = {'n': '\n', 't': '\t', 'r': '', 'b': '\b', 'f': '\f',
                       'v': '\v', '0': '\0', '\\': '\\', "'": "'", '"': '"', '`': '`'}
            if e in mapping:
                out.append(mapping[e]); j += 2; continue
            if e == 'u':
                out.append(chr(int(src[j+2:j+6], 16))); j += 6; continue
            if e == 'x':
                out.append(chr(int(src[j+2:j+4], 16))); j += 4; continue
            out.append(e); j += 2; continue
        if c == q:
            return "".join(out), j + 1
        out.append(c)
        j += 1
    return None, i

pat = re.compile(r'template\s*:\s*')

for f in sorted(glob.glob(BUILD + "/*.js")):
    name = os.path.basename(f)
    if name in ("polyfills.js", "vendor.js", "sw-toolbox.js", "main.css"):
        continue
    src = open(f, encoding="utf-8", errors="replace").read()
    items = []
    for m in pat.finditer(src):
        k = m.end()
        ruta = None
        # Ionic antepone la anotación /*ion-inline-start:"ruta\archivo.html"*/
        while k < len(src) and src[k] in " \t\n\r":
            k += 1
        if src.startswith("/*", k):
            cierre = src.find("*/", k)
            if cierre < 0:
                continue
            comentario = src[k:cierre]
            mm = re.search(r'ion-inline-start:"([^"]+)"', comentario)
            if mm:
                ruta = mm.group(1).replace("\\", "/").split("/")[-1]
            k = cierre + 2
        while k < len(src) and src[k] in " \t\n\r":
            k += 1
        s, end = find_string(src, k)
        if s and ("<" in s) and len(s) > 15:
            items.append((s, ruta))
    if not items:
        continue
    base = name.replace(".js", "")
    for k, (html, ruta) in enumerate(items, 1):
        tag = ruta if ruta else f"{k:02d}"
        path = f"{OUT}/{base}_{tag}"
        open(path, "w", encoding="utf-8").write(html)
    print(f"{name}: {len(items)} plantillas")
