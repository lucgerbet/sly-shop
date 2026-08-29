import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";
import { generatePhotorealisticRender } from "@/lib/fal";
import {
  JACKET_STYLES,
  CLOSURES,
  LAPELS,
  BUTTON_MATERIALS,
  COLOR_FAMILIES,
  PATTERNS,
  TROUSER_CUTS,
  PLEATS,
  HEMS,
} from "@/app/[locale]/customize/data";

const CANONICAL_ORIGIN = "https://www.sly-atelier.com";

// Every field is re-validated against the real option lists server-side
// (not just "is a string") — this prompt is sent to a paid third-party AI
// service, so a client can't be trusted to supply arbitrary prompt text here.
const bodySchema = z.object({
  type: z.enum(["suit", "blazer", "trousers"]),
  jacketStyle: z.string().optional(),
  closure: z.string().optional(),
  jacketButtons: z.string().optional(),
  lapel: z.string().optional(),
  colorType: z.enum(["solid", "pattern", "custom", ""]).optional(),
  colorFamily: z.string().optional(),
  color: z.string().optional(),
  pattern: z.string().optional(),
  trouserCut: z.string().optional(),
  pleats: z.string().optional(),
  hem: z.string().optional(),
});

function findById<T extends { id: string }>(list: T[], id: string | undefined): T | undefined {
  return id ? list.find((item) => item.id === id) : undefined;
}

// Best-effort, in-memory, single-instance cache — same caveat as
// isRateLimited in lib/rate-limit.ts (Vercel serverless instances aren't
// shared/durable). It still meaningfully cuts cost: the client already skips
// calling this route at all for a combination it has cached itself
// (localStorage, see renderPreview.ts), so this mainly helps when several
// different visitors land on the same warm instance and pick a popular
// combination (e.g. navy, notch, two-button) independently. A real
// cross-instance cache would need a shared store (Vercel KV/Upstash) this
// project doesn't have configured.
const CACHE_TTL_MS = 24 * 60 * 60_000;
const renderCache = new Map<string, { imageUrl: string; expires: number }>();

// Kept in sync with RENDER_LOGIC_VERSION in customize/renderPreview.ts —
// bump both together whenever the prompt-building logic below changes, so a
// stale cached entry (here or in a visitor's browser) never masks the fix.
const RENDER_LOGIC_VERSION = "v3";

function cacheKey(body: z.infer<typeof bodySchema>): string {
  return `${RENDER_LOGIC_VERSION}:${JSON.stringify(body)}`;
}

function describeFabric(colorType: string | undefined, colorFamily: string | undefined, color: string | undefined, pattern: string | undefined) {
  const family = findById(COLOR_FAMILIES, colorFamily);
  const shade = family?.shades.find((s) => s.id === color);
  if (!family || !shade) return { text: "a classic dark navy wool suiting fabric", imageUrl: undefined as string | undefined, hex: undefined as string | undefined };
  // A pattern (checks/stripes/etc.) is never backed by a real swatch photo of
  // that exact motif — texture photos are for the plain/solid shade only.
  const imageUrl = colorType !== "pattern" && shade.texture ? `${CANONICAL_ORIGIN}${shade.texture}` : undefined;
  if (colorType === "pattern") {
    const patternDef = findById(PATTERNS, pattern);
    const patternText = patternDef ? `a ${patternDef.label.toLowerCase()} pattern` : "a subtle pattern";
    return { text: `${family.label.toLowerCase()} ${shade.label.toLowerCase()} wool fabric with ${patternText}`, imageUrl: undefined, hex: undefined };
  }
  return { text: `${family.label.toLowerCase()} ${shade.label.toLowerCase()} wool fabric`, imageUrl, hex: shade.hex };
}

// Explains what each reference image is FOR — without this, a model given
// two images and a text-only fabric description has no reason to actually
// look at the second image at all, and was observed defaulting to a generic
// interpretation of the text instead of the real fabric swatch photo.
// Even with that instruction, the model was observed still leaning too close
// to the first (construction) image's own inherent color — e.g. keeping a
// dark navy pinstripe base photo's dark tone instead of the lighter, more
// silvery-grey real swatch. The explicit hex code + "prioritize over" wording
// below is a second, independent signal pointing at the same target color,
// on top of the image reference rather than instead of it.
function fabricInstruction(fabric: ReturnType<typeof describeFabric>): string {
  if (!fabric.imageUrl) return `Re-render this product photo in ${fabric.text}.`;
  const hexHint = fabric.hex ? ` Its overall color reads as approximately ${fabric.hex} in hex — noticeably lighter/more muted than the first reference photo's own base color; do not default to the first image's color.` : "";
  return (
    "The first reference image shows the garment's construction — keep its exact cut, silhouette and construction, " +
    "but IGNORE its own fabric color entirely. The second reference image is a close-up photo of the real fabric " +
    "swatch to actually use: replicate its precise color, brightness, weave pattern and texture on the garment as " +
    "faithfully as possible — this second image's color is the ground truth, more faithful than any text " +
    `description or the first image's color.${hexHint}`
  );
}

export async function POST(req: NextRequest) {
  // Generous-ish but still bounded — this calls a paid external API, and the
  // client now triggers it automatically once per completed step (see
  // page.tsx), not just on an explicit button click, so a normal session can
  // legitimately fire several requests without that being abuse.
  if (isRateLimited(req, { limit: 15, windowMs: 10 * 60_000 })) {
    return NextResponse.json({ error: "Trop de demandes de rendu, réessayez dans quelques minutes." }, { status: 429 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const body = parsed.data;

  const key = cacheKey(body);
  const cached = renderCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ imageUrl: cached.imageUrl });
  }

  const fabric = describeFabric(body.colorType, body.colorFamily, body.color, body.pattern);

  let designPhoto: string | undefined;
  let prompt: string;

  if (body.type === "trousers") {
    const cut = findById(TROUSER_CUTS, body.trouserCut);
    if (!cut) return NextResponse.json({ error: "Coupe de pantalon manquante" }, { status: 400 });
    designPhoto = cut.photo;
    const pleats = findById(PLEATS, body.pleats);
    const hem = findById(HEMS, body.hem);
    prompt = [
      fabricInstruction(fabric),
      "Keep the exact same cut, leg silhouette, waistband construction and camera framing as the reference photo — do not change the fit.",
      pleats ? `The trousers should have ${pleats.label.toLowerCase()} (${pleats.sub.toLowerCase()}).` : "",
      hem ? `Finish the hem as: ${hem.label.toLowerCase()} — ${hem.sub.toLowerCase()}.` : "",
      "Photorealistic studio product photography, clean light grey background, no mannequin, no person, no text or logos overlaid.",
    ].filter(Boolean).join(" ");
  } else {
    const style = findById(JACKET_STYLES, body.jacketStyle);
    if (!style) return NextResponse.json({ error: "Style de veste manquant" }, { status: 400 });
    designPhoto = style.photo;
    const closure = findById(CLOSURES, body.closure);
    const lapel = findById(LAPELS, body.lapel);
    const buttons = findById(BUTTON_MATERIALS, body.jacketButtons);
    prompt = [
      fabricInstruction(fabric),
      "Keep the exact same construction, shoulder line, camera angle and framing as the reference photo — do not change the fit or silhouette.",
      closure ? `The jacket closure should show ${closure.label.toLowerCase()} (${closure.sub.toLowerCase()}).` : "",
      lapel ? `The lapel style should be a ${lapel.label.toLowerCase()} (${lapel.sub.toLowerCase()}).` : "",
      buttons ? `The buttons should be in ${buttons.label.toLowerCase()} (${buttons.sub.toLowerCase()}).` : "",
      "Photorealistic studio product photography, clean light grey background, no mannequin, no person, no text or logos overlaid.",
    ].filter(Boolean).join(" ");
  }

  const imageUrls = [`${CANONICAL_ORIGIN}${designPhoto}`, ...(fabric.imageUrl ? [fabric.imageUrl] : [])];

  const result = await generatePhotorealisticRender({ imageUrls, prompt });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  renderCache.set(key, { imageUrl: result.imageUrl, expires: Date.now() + CACHE_TTL_MS });
  if (renderCache.size > 2000) {
    const now = Date.now();
    for (const [k, v] of renderCache) {
      if (v.expires <= now) renderCache.delete(k);
    }
  }

  return NextResponse.json({ imageUrl: result.imageUrl });
}
