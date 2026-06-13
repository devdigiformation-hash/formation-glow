import { createFileRoute } from "@tanstack/react-router";

// Image editing (image-to-image) via Lovable AI Gateway, Gemini Nano Banana.
// Accepts { prompt, imageDataUrl } and returns { b64_json }.
export const Route = createFileRoute("/api/edit-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { prompt?: string; imageDataUrl?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }
        const prompt = (body.prompt ?? "").trim();
        const img = (body.imageDataUrl ?? "").trim();
        if (!prompt) return new Response("Missing prompt", { status: 400 });
        if (!img.startsWith("data:image/"))
          return new Response("Missing or invalid image", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/images/generations",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3.1-flash-image-preview",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: img } },
                  ],
                },
              ],
              modalities: ["image", "text"],
            }),
          },
        );
        const text = await upstream.text();
        if (!upstream.ok) {
          return new Response(text || "Upstream error", { status: upstream.status });
        }
        try {
          const json = JSON.parse(text) as {
            data?: { b64_json?: string }[];
          };
          const b64 = json.data?.[0]?.b64_json;
          if (!b64) return new Response("No image returned", { status: 502 });
          return Response.json({ b64_json: b64 });
        } catch {
          return new Response("Bad upstream response", { status: 502 });
        }
      },
    },
  },
});
