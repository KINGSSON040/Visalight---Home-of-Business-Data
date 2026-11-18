import "server-only";

import { del, get } from "@vercel/blob";
import { t } from "@/lib/content/copy";
import { CV_MAX_BYTES, DOCX_MIME, PDF_MIME, matchesMagic } from "@/lib/validation/cv";

export type CvFile = {
  pathname: string;
  filename: string;
  contentType: string;
  bytes: Uint8Array;
};

function attachmentName(pathname: string, contentType: string): string {
  const base = pathname.split("/").pop() ?? "cv";
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, "");
  if (clean.toLowerCase().endsWith(".pdf") || clean.toLowerCase().endsWith(".docx")) return clean;
  return contentType === PDF_MIME ? "cv.pdf" : "cv.docx";
}

export async function readPrivateCv(pathname: string): Promise<{ ok: true; file: CvFile } | { ok: false; message: string }> {
  if (
    !pathname ||
    pathname.includes("..") ||
    pathname.startsWith("/") ||
    pathname.startsWith("http") ||
    pathname.includes("\\")
  ) {
    return { ok: false, message: t("errors.cvPath") };
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false, message: t("errors.cvPath") };
  }
  try {
    const result = await get(pathname, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return { ok: false, message: t("errors.cvPath") };
    }
    const contentType = result.blob.contentType;
    if (contentType !== PDF_MIME && contentType !== DOCX_MIME) {
      await del(pathname);
      return { ok: false, message: t("errors.cvType") };
    }
    if (result.blob.size > CV_MAX_BYTES) {
      await del(pathname);
      return { ok: false, message: t("errors.cvSize") };
    }
    const bytes = new Uint8Array(await new Response(result.stream).arrayBuffer());
    if (bytes.byteLength > CV_MAX_BYTES) {
      await del(pathname);
      return { ok: false, message: t("errors.cvSize") };
    }
    if (!matchesMagic(bytes, contentType)) {
      await del(pathname);
      return { ok: false, message: t("errors.cvMagic") };
    }
    return {
      ok: true,
      file: {
        pathname,
        filename: attachmentName(pathname, contentType),
        contentType,
        bytes,
      },
    };
  } catch {
    return { ok: false, message: t("errors.cvPath") };
  }
}

export async function deletePrivateCv(pathname: string): Promise<void> {
  await del(pathname);
}
