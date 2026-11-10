// Just enough PNG for the avatar pictures: reads 8-bit palette, RGB and RGBA files into RGBA bytes, and writes
// RGBA. No dependencies, so the scripts here run on a bare checkout.

import fs from "node:fs";
import zlib from "node:zlib";

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/** @returns {{ width: number, height: number, data: Uint8ClampedArray }} RGBA, row by row */
export function readPng(file) {
  const buf = fs.readFileSync(file);
  if (!buf.subarray(0, 8).equals(SIGNATURE)) throw new Error(`${file}: not a PNG`);
  let width = 0;
  let height = 0;
  let type = 0;
  let palette = null;
  let alpha = null;
  const idat = [];
  for (let at = 8; at < buf.length; ) {
    const length = buf.readUInt32BE(at);
    const name = buf.toString("latin1", at + 4, at + 8);
    const body = buf.subarray(at + 8, at + 8 + length);
    if (name === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      type = body[9];
      if (body[8] !== 8 || body[12] !== 0 || ![2, 3, 6].includes(type)) {
        throw new Error(`${file}: only 8-bit palette, RGB and RGBA pictures, not interlaced`);
      }
    } else if (name === "PLTE") palette = body;
    else if (name === "tRNS") alpha = body;
    else if (name === "IDAT") idat.push(body);
    at += 12 + length;
  }
  const bpp = type === 3 ? 1 : type === 2 ? 3 : 4;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const px = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let add = 0;
      if (filter === 1) add = a;
      else if (filter === 2) add = b;
      else if (filter === 3) add = (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[y * stride + x] = (raw[line + x] + add) & 255;
    }
  }
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    if (type === 3) {
      const n = px[i];
      data[i * 4] = palette[n * 3];
      data[i * 4 + 1] = palette[n * 3 + 1];
      data[i * 4 + 2] = palette[n * 3 + 2];
      data[i * 4 + 3] = alpha && n < alpha.length ? alpha[n] : 255;
    } else {
      data[i * 4] = px[i * bpp];
      data[i * 4 + 1] = px[i * bpp + 1];
      data[i * 4 + 2] = px[i * bpp + 2];
      data[i * 4 + 3] = bpp === 4 ? px[i * bpp + 3] : 255;
    }
  }
  return { width, height, data };
}

const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function chunk(name, body) {
  const out = Buffer.alloc(12 + body.length);
  out.writeUInt32BE(body.length, 0);
  out.write(name, 4, "latin1");
  body.copy(out, 8);
  let c = -1;
  for (let i = 4; i < 8 + body.length; i++) c = CRC[(c ^ out[i]) & 255] ^ (c >>> 8);
  out.writeInt32BE(~c, 8 + body.length);
  return out;
}

/** Writes RGBA bytes as a PNG, each row filtered whichever way packs smallest */
export function writePng(file, { width, height, data }) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  const tries = [0, 1, 2, 4].map(() => Buffer.alloc(stride));
  for (let y = 0; y < height; y++) {
    let best = 0;
    let bestCost = Infinity;
    tries.forEach((line, n) => {
      const filter = [0, 1, 2, 4][n];
      let cost = 0;
      for (let x = 0; x < stride; x++) {
        const v = data[y * stride + x];
        const a = x >= 4 ? data[y * stride + x - 4] : 0;
        const b = y > 0 ? data[(y - 1) * stride + x] : 0;
        const c = x >= 4 && y > 0 ? data[(y - 1) * stride + x - 4] : 0;
        let sub = 0;
        if (filter === 1) sub = a;
        else if (filter === 2) sub = b;
        else if (filter === 4) {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          sub = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        line[x] = (v - sub) & 255;
        cost += line[x] < 128 ? line[x] : 256 - line[x];
      }
      if (cost < bestCost) {
        bestCost = cost;
        best = n;
      }
    });
    raw[y * (stride + 1)] = [0, 1, 2, 4][best];
    tries[best].copy(raw, y * (stride + 1) + 1);
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(width, 0);
  head.writeUInt32BE(height, 4);
  head[8] = 8;
  head[9] = 6;
  fs.writeFileSync(
    file,
    Buffer.concat([SIGNATURE, chunk("IHDR", head), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))])
  );
}
