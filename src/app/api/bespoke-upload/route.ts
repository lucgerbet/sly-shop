import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isRateLimited } from "@/lib/rate-limit";

// Issues short-lived, scoped upload tokens for the bespoke reference-photo
// uploader — the browser then uploads the file bytes straight to Vercel
// Blob, never through this Next.js server (keeps a 10MB photo well clear of
// any serverless function body-size limit). No onUploadCompleted callback:
// that would need Vercel to reach back out to this URL, which doesn't work
// against localhost in dev — the client already gets the blob's public URL
// back directly from `upload()`, and that's all /bespoke needs to carry the
// photo forward into the checkout session it creates right after.
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (isRateLimited(req, { limit: 20, windowMs: 5 * 60_000 })) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans quelques minutes" }, { status: 429 });
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
        addRandomSuffix: true,
        maximumSizeInBytes: 15 * 1024 * 1024,
      }),
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error("[bespoke-upload] token generation failed", err);
    return NextResponse.json({ error: "Impossible de préparer l'envoi de la photo" }, { status: 400 });
  }
}
