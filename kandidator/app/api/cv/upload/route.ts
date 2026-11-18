import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { CV_MAX_BYTES, allowedCvTypes, extensionOf, mimeForExtension } from "@/lib/validation/cv";

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Uppladdning är inte konfigurerad." }, { status: 503 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Ogiltig begäran." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const token = readTurnstileToken(clientPayload);
        const allowed = await verifyTurnstile(token);
        if (!allowed) {
          throw new Error("turnstile");
        }
        const mime = mimeForExtension(extensionOf(pathname));
        if (!mime) {
          throw new Error("type");
        }
        return {
          allowedContentTypes: [...allowedCvTypes],
          maximumSizeInBytes: CV_MAX_BYTES,
          addRandomSuffix: true,
          allowOverwrite: false,
        };
      },
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Uppladdningen stoppades." }, { status: 400 });
  }
}

function readTurnstileToken(clientPayload: string | null): string {
  if (!clientPayload) return "";
  try {
    const parsed = JSON.parse(clientPayload) as { turnstileToken?: unknown };
    return typeof parsed.turnstileToken === "string" ? parsed.turnstileToken : "";
  } catch {
    return "";
  }
}
