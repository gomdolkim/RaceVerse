/**
 * Tiny PostGIS EWKB hex parser.
 * Used as a fallback when querying tables directly (instead of the
 * `races_public` view, which already exposes lat/lng numeric columns).
 *
 * Supports POINT only — sufficient for race location coords.
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export function parseEwkbPoint(hex: string | null | undefined): LatLng | null {
  if (!hex) return null;
  const buf = hexToBytes(hex);
  if (buf.length < 21) return null;

  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const littleEndian = view.getUint8(0) === 1;

  // Read type (with optional SRID flag)
  const type = view.getUint32(1, littleEndian);
  const hasSrid = (type & 0x20000000) !== 0;
  const baseType = type & 0xff;
  if (baseType !== 1) return null; // not a POINT

  let offset = 5;
  if (hasSrid) offset += 4;

  if (buf.length < offset + 16) return null;
  const x = view.getFloat64(offset, littleEndian);
  const y = view.getFloat64(offset + 8, littleEndian);
  return { longitude: x, latitude: y };
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("\\x") ? hex.slice(2) : hex;
  const len = clean.length / 2;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
