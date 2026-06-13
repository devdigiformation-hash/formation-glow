// =============================================================================
// RebrandBundlePanel
// Surfaces the AI Smart Rebrand result as a structured, copy-friendly bundle:
//   • Headline / Caption / CTA / Hashtags (each with copy)
//   • Full Post bundle (combined post + partner contact + hashtags)
//   • External AI master prompt (copy)
//   • Per-tool cards (Lovable / ChatGPT / Gemini / Ideogram)
//   • 12-step external AI funnel
// Mobile: each section is an <details> accordion so the page stays scannable
// and the copy buttons remain visible.
// =============================================================================
import { useMemo, useState } from "react";
import {
  Copy, Check, ExternalLink, Sparkles, ChevronDown, Wand2, Hash,
  MessageSquare, Megaphone, Layers, ListChecks, Mail, Globe, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { buildMasterPrompt, EXTERNAL_AI_STEPS } from "@/lib/rebrand-master-prompt";

export type RebrandBundleResult = {
  title: string;
  headline: string;
  caption: string;
  cta: string;
  description: string;
  hashtags: string[];
  external_prompt: string;
  imageDataUrl?: string;
};

export type BundleBrand = {
  brandName: string;
  email: string;
  website: string;
  whatsapp: string;
  primary: string;
  secondary: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
};

const EXTERNAL_TOOLS = [
  {
    id: "lovable",
    label: "Lovable",
    url: "https://lovable.dev",
    bestFor: "Best for: AI-built mini funnels, landing pages and image rebrands inside one chat.",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    url: "https://chat.openai.com",
    bestFor: "Best for: image regeneration with DALL·E, refining captions and rewriting copy.",
  },
  {
    id: "gemini",
    label: "Gemini",
    url: "https://gemini.google.com",
    bestFor: "Best for: photorealistic redesigns with Nano Banana and tight brand reskins.",
  },
  {
    id: "ideogram",
    label: "Ideogram",
    url: "https://ideogram.ai",
    bestFor: "Best for: poster-style creatives with crisp readable text and typographic layouts.",
  },
] as const;

type ToolId = (typeof EXTERNAL_TOOLS)[number]["id"];

export function RebrandBundlePanel({
  result,
  brand,
  serviceName,
  serviceSlug,
  referenceCreativeUrl,
  onFlash,
}: {
  result: RebrandBundleResult;
  brand: BundleBrand;
  serviceName?: string;
  serviceSlug?: string;
  referenceCreativeUrl?: string;
  onFlash: (msg: string) => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const hashtagText = result.hashtags.join(" ");
  const contactBlock = [
    brand.email && `📧 ${brand.email}`,
    brand.website && `🌐 ${brand.website}`,
    brand.whatsapp && `📲 ${brand.whatsapp}`,
  ].filter(Boolean).join("\n");

  const fullPost = [
    result.headline,
    result.caption,
    result.cta,
    contactBlock,
    hashtagText,
  ].filter((s) => s && String(s).trim().length > 0).join("\n\n");

  // Prefer the AI's external_prompt; fall back to a freshly built master prompt.
  const masterPrompt = useMemo(() => {
    if (result.external_prompt && result.external_prompt.trim().length > 0) {
      return result.external_prompt;
    }
    return buildMasterPrompt({
      partner: {
        brandName: brand.brandName,
        email: brand.email,
        website: brand.website,
        whatsapp: brand.whatsapp,
        primary: brand.primary,
        secondary: brand.secondary,
        facebook: brand.facebook,
        instagram: brand.instagram,
        linkedin: brand.linkedin,
      },
      serviceName,
      serviceSlug,
      captionSummary: [result.headline, result.caption].filter(Boolean).join("\n\n"),
      cta: result.cta,
      referenceCreativeUrl,
    });
  }, [result, brand, serviceName, serviceSlug, referenceCreativeUrl]);

  const copy = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      onFlash(`${label} copied`);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
    } catch {
      onFlash("Copy failed");
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* ── Bundle ─────────────────────────────────────────────────────── */}
      <Panel
        title="Generated bundle"
        description="Everything you need to publish this post — copy each block, or copy the full post."
      >
        <div className="flex items-center justify-end mb-3">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => copy(fullPost, "full", "Full post bundle")}
          >
            {copiedKey === "full" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            Copy full post
          </Button>
        </div>

        <Accordion title="Headline" icon={<Megaphone className="h-3.5 w-3.5" />} defaultOpen>
          <BlockBody
            text={result.headline || "(not generated)"}
            onCopy={() => copy(result.headline, "headline", "Headline")}
            copied={copiedKey === "headline"}
          />
        </Accordion>

        <Accordion title="Caption / Description" icon={<MessageSquare className="h-3.5 w-3.5" />} defaultOpen>
          <BlockBody
            text={result.caption || result.description}
            pre
            onCopy={() => copy(result.caption || result.description, "caption", "Caption")}
            copied={copiedKey === "caption"}
          />
        </Accordion>

        <Accordion title="CTA" icon={<Wand2 className="h-3.5 w-3.5" />}>
          <BlockBody
            text={result.cta || "(not generated)"}
            onCopy={() => copy(result.cta, "cta", "CTA")}
            copied={copiedKey === "cta"}
          />
        </Accordion>

        <Accordion title="Hashtags" icon={<Hash className="h-3.5 w-3.5" />}>
          <BlockBody
            text={hashtagText || "(none)"}
            onCopy={() => copy(hashtagText, "hashtags", "Hashtags")}
            copied={copiedKey === "hashtags"}
          />
        </Accordion>

        <Accordion title="Your contact info (auto-attached)" icon={<Mail className="h-3.5 w-3.5" />}>
          <div className="rounded-xl p-3 bg-foreground/[0.04] border border-border/40 text-xs space-y-1">
            <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" /> {brand.email || "—"}</div>
            <div className="flex items-center gap-2"><Globe className="h-3 w-3 text-muted-foreground" /> {brand.website || "—"}</div>
            <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground" /> {brand.whatsapp || "—"}</div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Generated outputs never show DigiFormation contact info.
            </p>
          </div>
        </Accordion>

        <Accordion title="Full Post Bundle" icon={<Layers className="h-3.5 w-3.5" />}>
          <BlockBody
            text={fullPost}
            pre
            onCopy={() => copy(fullPost, "fullbody", "Full post bundle")}
            copied={copiedKey === "fullbody"}
          />
        </Accordion>
      </Panel>

      {/* ── Master prompt — code-block style ───────────────────────────── */}
      <Panel
        title="External AI master prompt"
        description="Paste this into any external AI tool together with the reference creative and your logo."
      >
        <div className="rounded-xl border border-border/60 bg-[#0a0e16] text-[#e2e8f0] overflow-hidden shadow-inner">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/50 font-semibold">
              <span className="h-2 w-2 rounded-full bg-rose-400/70" />
              <span className="h-2 w-2 rounded-full bg-amber-400/70" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
              <span className="ml-2">master_prompt.txt · {masterPrompt.length} chars</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11px] text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => copy(masterPrompt, "master", "Master prompt")}
            >
              {copiedKey === "master" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copiedKey === "master" ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="px-4 py-3.5 text-[12px] leading-relaxed whitespace-pre-wrap break-words font-mono text-white/90 max-h-[420px] overflow-y-auto">
            {masterPrompt}
          </pre>
        </div>
      </Panel>

      {/* ── External AI tool cards ─────────────────────────────────────── */}
      <Panel
        title="Choose your external AI tool"
        description="Use your own free account. DigiFormation credits are NOT consumed."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {EXTERNAL_TOOLS.map((t) => (
            <ToolCard
              key={t.id}
              id={t.id}
              label={t.label}
              url={t.url}
              bestFor={t.bestFor}
              onCopy={() => copy(masterPrompt, `master-${t.id}`, `${t.label} prompt`)}
              copied={copiedKey === `master-${t.id}`}
            />
          ))}
        </div>
      </Panel>

      {/* ── 12-step funnel ─────────────────────────────────────────────── */}
      <Panel
        title="External AI workflow — 12 steps"
        description="Follow these in order to produce a perfect rebrand from any external AI tool."
      >
        <ol className="space-y-2">
          {EXTERNAL_AI_STEPS.map((s) => (
            <StepRow
              key={s.step}
              step={s.step}
              title={s.title}
              action={stepAction(s.step, {
                referenceCreativeUrl,
                onCopyCaption: () => copy(fullPost, `step-caption`, "Caption bundle"),
                onCopyMaster: () => copy(masterPrompt, `step-master`, "Master prompt"),
              })}
            />
          ))}
        </ol>
      </Panel>
    </div>
  );
}

// ─── Small subcomponents ────────────────────────────────────────────────────
function Accordion({
  title, icon, defaultOpen, children,
}: { title: string; icon?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-border/50 bg-foreground/[0.02] mb-2 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex items-center justify-between gap-2 cursor-pointer px-3 py-2.5">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          {icon}{title}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}

function BlockBody({
  text, pre, onCopy, copied,
}: { text: string; pre?: boolean; onCopy: () => void; copied?: boolean }) {
  return (
    <div className="rounded-xl p-3 bg-foreground/[0.04] border border-border/40">
      <div className="flex items-center justify-end mb-1.5">
        <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={onCopy}>
          {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className={cn("text-xs leading-relaxed break-words", pre ? "whitespace-pre-wrap" : "")}>{text}</div>
    </div>
  );
}

function ToolCard({
  id, label, url, bestFor, onCopy, copied,
}: { id: ToolId; label: string; url: string; bestFor: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-foreground/[0.02] p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="font-display font-semibold text-sm">{label}</div>
        <Badge variant="outline" className="text-[9px] uppercase tracking-wider">Your account</Badge>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{bestFor}</p>
      <ul className="text-[10px] text-muted-foreground/80 space-y-0.5 pl-3 list-disc">
        <li>Login required (use your own free account)</li>
        <li>Does not consume DigiFormation credits</li>
      </ul>
      <div className="flex gap-1.5 mt-1 min-w-0">
        <Button size="sm" variant="outline" className="flex-1 min-w-0 h-8 text-[11px] px-2" onClick={onCopy}>
          {copied ? <Check className="h-3 w-3 mr-1 shrink-0" /> : <Copy className="h-3 w-3 mr-1 shrink-0" />}
          <span className="truncate">{copied ? "Copied" : "Copy Prompt"}</span>
        </Button>
        <Button asChild size="sm" className="flex-1 min-w-0 h-8 text-[11px] px-2">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">Open {label}</span>
          </a>
        </Button>
      </div>
    </div>
  );
}

function StepRow({ step, title, action }: { step: number; title: string; action?: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-border/40 bg-foreground/[0.02] p-3">
      <span
        className="h-8 w-8 rounded-full text-white text-xs font-semibold inline-flex items-center justify-center shrink-0 shadow-[var(--shadow-brand-glow)]"
        style={{ background: "var(--gradient-brand)" }}
      >
        {step}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        {action && <div className="mt-2 flex flex-wrap gap-1.5">{action}</div>}
      </div>
    </li>
  );
}

function stepAction(
  step: number,
  ctx: { referenceCreativeUrl?: string; onCopyCaption: () => void; onCopyMaster: () => void },
): React.ReactNode | null {
  switch (step) {
    case 1:
      return ctx.referenceCreativeUrl ? (
        <Button asChild size="sm" variant="outline" className="h-7 text-[11px]">
          <a href={ctx.referenceCreativeUrl} target="_blank" rel="noopener noreferrer" download>
            <ExternalLink className="h-3 w-3 mr-1" /> Open reference
          </a>
        </Button>
      ) : null;
    case 2:
      return (
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={ctx.onCopyCaption}>
          <Copy className="h-3 w-3 mr-1" /> Copy caption bundle
        </Button>
      );
    case 3:
      return (
        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={ctx.onCopyMaster}>
          <Copy className="h-3 w-3 mr-1" /> Copy master prompt
        </Button>
      );
    case 4:
      return (
        <div className="flex flex-wrap gap-1.5">
          {EXTERNAL_TOOLS.map((t) => (
            <Button key={t.id} asChild size="sm" variant="ghost" className="h-7 text-[11px] px-2">
              <a href={t.url} target="_blank" rel="noopener noreferrer">{t.label}</a>
            </Button>
          ))}
        </div>
      );
    default:
      return null;
  }
}
