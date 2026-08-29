// fal.ai Nano Banana (gemini-25-flash-image/edit) queue-REST integration —
// same model/endpoint contract validated in the sibling fusari-styling-studio
// project, but reimplemented independently here on purpose: this project must
// never import from or call into that codebase (separate client, separate
// credentials — see the "keep client properties separate" rule this repo
// follows). Uses its own FAL_KEY, configured only for sly-shop.
const FAL_MODEL = "fal-ai/gemini-25-flash-image/edit";
const FAL_QUEUE_BASE = "https://queue.fal.run";
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 45_000;

type FalRenderResult = { ok: true; imageUrl: string } | { ok: false; error: string };

export async function generatePhotorealisticRender(opts: {
  imageUrls: string[];
  prompt: string;
}): Promise<FalRenderResult> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    return { ok: false, error: "fal.ai n'est pas configuré (FAL_KEY manquante)" };
  }

  let submitRes: Response;
  try {
    submitRes = await fetch(`${FAL_QUEUE_BASE}/${FAL_MODEL}`, {
      method: "POST",
      headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ image_urls: opts.imageUrls, prompt: opts.prompt }),
    });
  } catch {
    return { ok: false, error: "Impossible de contacter le service de rendu" };
  }
  if (!submitRes.ok) {
    return { ok: false, error: `Échec de la soumission du rendu (${submitRes.status})` };
  }
  const submitData = (await submitRes.json().catch(() => null)) as { request_id?: string; status_url?: string; response_url?: string } | null;
  const requestId = submitData?.request_id;
  if (!requestId) {
    return { ok: false, error: "Réponse inattendue du service de rendu" };
  }

  const statusUrl = submitData.status_url ?? `${FAL_QUEUE_BASE}/${FAL_MODEL}/requests/${requestId}/status`;
  const resultUrl = submitData.response_url ?? `${FAL_QUEUE_BASE}/${FAL_MODEL}/requests/${requestId}`;

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    let statusRes: Response;
    try {
      statusRes = await fetch(statusUrl, { headers: { Authorization: `Key ${apiKey}` } });
    } catch {
      continue;
    }
    if (!statusRes.ok) continue;
    const statusData = (await statusRes.json().catch(() => null)) as { status?: string } | null;
    if (statusData?.status !== "COMPLETED") continue;

    let resultRes: Response;
    try {
      resultRes = await fetch(resultUrl, { headers: { Authorization: `Key ${apiKey}` } });
    } catch {
      return { ok: false, error: "Le rendu a été généré mais n'a pas pu être récupéré" };
    }
    if (!resultRes.ok) {
      return { ok: false, error: "Le rendu a été généré mais n'a pas pu être récupéré" };
    }
    const resultData = (await resultRes.json().catch(() => null)) as { images?: { url?: string }[] } | null;
    const imageUrl = resultData?.images?.[0]?.url;
    if (!imageUrl) {
      return { ok: false, error: "Le service de rendu n'a renvoyé aucune image" };
    }
    return { ok: true, imageUrl };
  }

  return { ok: false, error: "Le rendu a pris trop de temps, réessayez" };
}
