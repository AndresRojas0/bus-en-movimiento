#!/usr/bin/env python3
# Parser minimo de Android Binary XML (AXML)
import struct, sys

path = sys.argv[1]
data = open(path, 'rb').read()

def u16(o): return struct.unpack_from('<H', data, o)[0]
def u32(o): return struct.unpack_from('<I', data, o)[0]
def s32(o): return struct.unpack_from('<i', data, o)[0]

# ResXMLTree_header = 8 bytes
assert u16(0) == 0x0003, "no es AXML"

# String pool: primer chunk tras el header
sp = 8
assert u16(sp) == 0x0001, "string pool no encontrado"
sp_size = u32(sp + 4)
stringCount = u32(sp + 8)
styleCount = u32(sp + 12)
flags = u32(sp + 16)
stringsStart = u32(sp + 20)
utf8 = bool(flags & (1 << 8))
strings = []
for i in range(stringCount):
    off = u32(sp + 28 + i * 4)
    p = sp + stringsStart + off
    def read_len(p, utf8):
        if utf8:
            b = data[p]; p += 1
            if b & 0x80:
                b = ((b & 0x7F) << 8) | data[p]; p += 1
            return b, p
        else:
            w = u16(p); p += 2
            if w & 0x8000:
                w = ((w & 0x7FFF) << 16) | u16(p); p += 2
            return w, p
    ln, p = read_len(p, utf8)
    if utf8:
        # longitud en bytes UTF-8 (ignoramos la de chars)
        lnc, p = read_len(p, utf8)
        s = data[p:p + ln].decode('utf-8', 'replace')
    else:
        s = data[p:p + ln * 2].decode('utf-16-le', 'replace')
    strings.append(s)

def S(i):
    return strings[i] if i >= 0 and i < len(strings) else None

TYPES = {0x0102: 'START_ELEMENT', 0x0103: 'END_ELEMENT'}
CHUNK_STRING = 0x0001

# Recorrer chunks de XML
pos = 8 + sp_size
out = []
depth = 0
while pos + 8 <= len(data):
    typ = u16(pos)
    size = u32(pos + 4)
    if size < 8:
        break
    if typ == 0x0102:  # START_ELEMENT
        line = u32(pos + 8)
        ns = s32(pos + 16)
        name = s32(pos + 20)
        attrStart = u16(pos + 24)
        attrSize = u16(pos + 26)
        attrCount = u16(pos + 28)
        ident = S(name)
        attrs = {}
        base = pos + 16 + attrStart  #ResXMLTree_attrExt empieza en pos+16
        for a in range(attrCount):
            ao = pos + 16 + attrStart + a * attrSize
            ans, aname, araw = s32(ao), s32(ao + 4), s32(ao + 8)
            dsize = u16(ao + 12)
            dtyp = data[ao + 15]      # Res_value.dataType (byte)
            dval = u32(ao + 16)
            key = S(aname)
            if dtyp == 3:      # string
                v = S(dval)
            elif dtyp == 0x12: # boolean
                v = 'true' if dval else 'false'
            elif dtyp == 0x10: # int dec
                v = str(s32(ao + 16))
            elif dtyp == 0x11: # int hex
                v = hex(dval)
            elif dtyp == 0x01: # reference
                v = '@0x%08x' % dval
            elif dtyp == 0x1c: # int color
                v = '#%08x' % dval
            else:
                v = S(araw) if araw != -1 else str(dval)
            if key:
                attrs[key] = v
        out.append(('  ' * depth) + '<' + ident + ' ' +
                   ' '.join('%s="%s"' % (k, v) for k, v in attrs.items()) + '>')
        depth += 1
    elif typ == 0x0103:
        depth = max(0, depth - 1)
    pos += size

print('\n'.join(out))
