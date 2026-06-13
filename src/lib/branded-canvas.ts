// Render the branded creative card to a PNG/JPG data URL via canvas.
// Mirrors the on-screen `CreativePreview` (branded variant) so what partners
// see is what they download.

export type BrandedRenderInput = {
  title: string;
  category: string;
  tagline: string;
  sourceImageUrl: string | null;
  primary: string;
  secondary: string;
  brandName: string;
  logoDataUrl: string | null;
  whatsapp: string;
  email: string;
  website: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
) {
  const words = text.split(/\s+/);
  let line = "";
  let lines: string[] = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{1,3}$/, "…");
  }
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length * lineHeight;
}

export async function renderBrandedCreative(
  input: BrandedRenderInput,
  format: "png" | "jpg" = "png",
): Promise<string> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradient from brand colors.
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, input.primary || "#22d3ee");
  grad.addColorStop(1, input.secondary || "#a78bfa");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Optional source image overlay.
  if (input.sourceImageUrl) {
    try {
      const img = await loadImage(input.sourceImageUrl);
      ctx.globalAlpha = 0.55;
      const iw = img.width;
      const ih = img.height;
      const scale = Math.max(W / iw, H / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, W, H);
    } catch {
      /* ignore — fall back to gradient only */
    }
  }

  // Header strip — logo + brand name.
  if (input.logoDataUrl) {
    try {
      const logo = await loadImage(input.logoDataUrl);
      ctx.save();
      const r = 18;
      ctx.beginPath();
      ctx.moveTo(60 + r, 60);
      ctx.arcTo(60 + 84, 60, 60 + 84, 60 + r, r);
      ctx.arcTo(60 + 84, 60 + 84, 60 + 84 - r, 60 + 84, r);
      ctx.arcTo(60, 60 + 84, 60, 60 + 84 - r, r);
      ctx.arcTo(60, 60, 60 + r, 60, r);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = "white";
      ctx.fillRect(60, 60, 84, 84);
      ctx.drawImage(logo, 60, 60, 84, 84);
      ctx.restore();
    } catch {
      /* skip logo */
    }
  }
  ctx.fillStyle = "white";
  ctx.font = "bold 38px system-ui, -apple-system, sans-serif";
  ctx.fillText(input.brandName || "Your Brand", input.logoDataUrl ? 168 : 60, 115);

  // Body — category eyebrow + title + tagline (lower-left).
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 28px system-ui, -apple-system, sans-serif";
  ctx.fillText((input.category || "").toUpperCase(), 60, H - 430);

  ctx.fillStyle = "white";
  ctx.font = "bold 84px system-ui, -apple-system, sans-serif";
  const titleHeight = wrapText(ctx, input.title, 60, H - 360, W - 120, 92, 3);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "400 34px system-ui, -apple-system, sans-serif";
  wrapText(ctx, input.tagline || "", 60, H - 360 + titleHeight + 24, W - 120, 42, 2);

  // Footer — contact strip.
  const lines = [
    input.website && `🌐  ${input.website}`,
    input.whatsapp && `📱  ${input.whatsapp}`,
    input.email && `✉️  ${input.email}`,
  ].filter(Boolean) as string[];
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, H - 30 - lines.length * 38 - 24, W, lines.length * 38 + 36);
  ctx.fillStyle = "white";
  ctx.font = "500 26px system-ui, -apple-system, sans-serif";
  lines.forEach((line, i) => {
    ctx.fillText(line, 60, H - 30 - (lines.length - 1 - i) * 38 - 12);
  });

  return canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.92);
}

export function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
