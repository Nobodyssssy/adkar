/**
 * Supported binary asset MIME types for stamp annotations.
 *
 * @public
 */
export type ImageMimeType = 'image/png' | 'image/jpeg' | 'application/pdf';
/**
 * Metadata extracted from a binary image buffer by inspecting magic bytes.
 * Raster formats include intrinsic pixel dimensions; PDF only identifies
 * the format (parsing MediaBox is non-trivial and unnecessary here).
 *
 * @public
 */
export type ImageMetadata = {
    mimeType: 'image/png';
    width: number;
    height: number;
} | {
    mimeType: 'image/jpeg';
    width: number;
    height: number;
} | {
    mimeType: 'application/pdf';
};
/**
 * Detect format and intrinsic dimensions of a binary image buffer.
 * Supports PNG, JPEG, and PDF detection.
 *
 * @returns metadata or `null` for unsupported/corrupt formats
 *
 * @public
 */
export declare function getImageMetadata(buffer: ArrayBuffer): ImageMetadata | null;
