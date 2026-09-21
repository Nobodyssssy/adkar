/**
 * Creates an uncompressed BMP blob from raw RGBA pixel data.
 *
 * Uses BI_BITFIELDS with channel masks matching RGBA byte order, so no
 * per-pixel byte swapping is needed. Top-down row order (negative height)
 * avoids row flipping. The result is a valid BMP that all modern browsers
 * can decode natively in `<img>` elements.
 *
 * This is dramatically faster than PNG/WebP/JPEG encoding via canvas.toBlob()
 * because it performs no compression — just a 66-byte header prepended to the
 * raw pixel buffer.
 */
export declare function rgbaToBmpBlob(rgba: Uint8ClampedArray, width: number, height: number): Blob;
