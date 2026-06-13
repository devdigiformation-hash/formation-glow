import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";

type ImageEventPayload = {
  type?: string;
  b64_json: string;
  partial_image_index?: number;
};

export async function streamImage(
  endpoint: string,
  payload: Record<string, unknown>,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
): Promise<void> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Image generation failed (${res.status}): ${txt.slice(0, 200)}`,
    );
  }

  let sawCompleted = false;
  const parser = createParser({
    onEvent(event) {
      if (
        event.event !== "image_generation.partial_image" &&
        event.event !== "image_generation.completed"
      )
        return;
      let data: ImageEventPayload;
      try {
        data = JSON.parse(event.data) as ImageEventPayload;
      } catch {
        return;
      }
      if (!data.b64_json) return;
      const isFinal = event.event === "image_generation.completed";
      flushSync(() => {
        onFrame(`data:image/png;base64,${data.b64_json}`, isFinal);
      });
      if (isFinal) sawCompleted = true;
    },
  });

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      parser.feed(value);
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  if (!sawCompleted)
    throw new Error("Image stream ended without a completed event.");
}
