"use client";

import { upload } from "@vercel/blob/client";
import { t } from "@/lib/content/copy";
import { extensionOf, mimeForExtension, safeCvFilename } from "@/lib/validation/cv";

export async function uploadCv(file: File, turnstileToken: string): Promise<string> {
  const pathname = safeCvFilename(file.name);
  const mime = mimeForExtension(extensionOf(file.name));
  if (!pathname || !mime) {
    throw new Error(t("forms.fileType"));
  }
  const blob = await upload(pathname, file, {
    access: "private",
    handleUploadUrl: "/api/cv/upload",
    contentType: mime,
    clientPayload: JSON.stringify({ turnstileToken }),
  });
  return blob.pathname;
}
