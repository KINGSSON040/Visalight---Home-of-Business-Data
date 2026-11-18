export const CV_MAX_BYTES = 5 * 1024 * 1024;

export const PDF_MIME = "application/pdf";
export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const allowedCvTypes = [PDF_MIME, DOCX_MIME] as const;

export function extensionOf(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function mimeForExtension(extension: string): string | null {
  if (extension === "pdf") return PDF_MIME;
  if (extension === "docx") return DOCX_MIME;
  return null;
}

export function isAllowedCvFile(filename: string, mime: string, size: number): string | null {
  const extension = extensionOf(filename);
  if (extension === "doc" || extension === "docm" || !mimeForExtension(extension)) {
    return "type";
  }
  if (mime && mime !== mimeForExtension(extension)) {
    return "type";
  }
  if (size > CV_MAX_BYTES) return "size";
  if (size <= 0) return "type";
  return null;
}

export function safeCvFilename(filename: string): string | null {
  const extension = extensionOf(filename);
  if (!mimeForExtension(extension)) return null;
  const stem = filename
    .slice(0, filename.length - extension.length - 1)
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const safeStem = stem || "cv";
  return `cv/${safeStem}.${extension}`;
}

export function isPdf(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

export function isZip(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

export function matchesMagic(bytes: Uint8Array, contentType: string): boolean {
  if (contentType === PDF_MIME) return isPdf(bytes);
  if (contentType === DOCX_MIME) return isZip(bytes);
  return false;
}
