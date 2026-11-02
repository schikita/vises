/**
 * Tile decoding for the captcha NN: GIF/JPEG bytes -> RGB -> bilinear resize
 * to the model input (144x72) -> NCHW Float32Array (/255).
 * Pure JS decoders (jpeg-js / gifuct-js) — no native deps.
 */
import jpeg from 'jpeg-js';
import { parseGIF, decompressFrames } from 'gifuct-js';

export type RgbImage = { width: number; height: number; rgb: Uint8Array };

export const decodeTile = (bytes: Buffer): RgbImage => {
  const magic = bytes.subarray(0, 3).toString('latin1');
  if (magic === 'GIF') return decodeGif(bytes);
  // JPEG (FF D8) or fallback attempt via jpeg-js
  return decodeJpeg(bytes);
};

const decodeJpeg = (bytes: Buffer): RgbImage => {
  const img = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: false });
  return { width: img.width, height: img.height, rgb: Buffer.from(img.data) };
};

const decodeGif = (bytes: Buffer): RgbImage => {
  const gif = parseGIF(bytes as unknown as ArrayBuffer);
  const frames = decompressFrames(gif, true);
  const first = frames[0];
  if (!first) throw new Error('gif: no frames');
  const { width, height } = first.dims;
  // composite the first frame patch (RGBA) onto an RGB buffer
  const rgb = new Uint8Array(width * height * 3);
  const patch = first.patch; // RGBA
  for (let i = 0; i < width * height; i++) {
    rgb[i * 3] = patch[i * 4]!;
    rgb[i * 3 + 1] = patch[i * 4 + 1]!;
    rgb[i * 3 + 2] = patch[i * 4 + 2]!;
  }
  return { width, height, rgb };
};

/** Bilinear resize to (w x h) and NCHW float normalization. */
export const tileToTensor = (
  img: RgbImage,
  w: number,
  h: number,
): Float32Array => {
  const x = new Float32Array(3 * h * w);
  const n = w * h;
  const sx = img.width / w;
  const sy = img.height / h;
  for (let cy = 0; cy < h; cy++) {
    const fy = Math.min(img.height - 1, (cy + 0.5) * sy - 0.5);
    const y0 = Math.max(0, Math.floor(fy));
    const y1 = Math.min(img.height - 1, y0 + 1);
    const wy = fy - y0;
    for (let cx = 0; cx < w; cx++) {
      const fx = Math.min(img.width - 1, (cx + 0.5) * sx - 0.5);
      const x0 = Math.max(0, Math.floor(fx));
      const x1 = Math.min(img.width - 1, x0 + 1);
      const wx = fx - x0;
      const dst = cy * w + cx;
      for (let c = 0; c < 3; c++) {
        const p00 = img.rgb[(y0 * img.width + x0) * 3 + c]!;
        const p01 = img.rgb[(y0 * img.width + x1) * 3 + c]!;
        const p10 = img.rgb[(y1 * img.width + x0) * 3 + c]!;
        const p11 = img.rgb[(y1 * img.width + x1) * 3 + c]!;
        const v =
          p00 * (1 - wx) * (1 - wy) + p01 * wx * (1 - wy) +
          p10 * (1 - wx) * wy + p11 * wx * wy;
        x[c * n + dst] = v / 255;
      }
    }
  }
  return x;
};
