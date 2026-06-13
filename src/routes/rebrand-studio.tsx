// =============================================================================
// Rebrand Studio — simplified manual workflow.
//
// 1. Pick a DigiFormation REFERENCE creative.
// 2. Confirm the TARGET partner brand (from profile — single source of truth).
// 3. Generate the rebrand bundle (caption + hashtags + master prompt) via AI.
// 4. Copy master prompt, open external AI tool, paste, generate the image.
// 5. Publish.
//
// No localStorage brand overrides, no in-app image generation, no Quick Rebrand.
// =============================================================================
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Wand2, Loader2, RotateCcw, Download, ExternalLink,
  Image as ImageIc, Building2, Phone, Mail, Globe, Facebook, Instagram,
  ShieldCheck, Target, ChevronRight,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CREATIVE_CATEGORIES } from "@/lib/creative-categories";
import {
  usePartnerProfile, useServices, useAdminCreatives, useAIUsage,
  useGeneratedCreatives,
} from "@/lib/data";
import type { AdminCreative } from "@/lib/data/types";
import { RebrandHistoryPanel } from "@/components/rebrand-history-panel";
import { useServerFn } from "@tanstack/react-start";
import { generateRebrandBundle } from "@/lib/generate-rebrand-bundle.functions";
import { creativeCategoryForService } from "@/lib/service-category";
import { PartnerProfileGate } from "@/components/partner-profile-gate";
import { RebrandBundlePanel, type RebrandBundleResult } from "@/components/rebrand-bundle-panel";

type StudioSearch = { serviceId?: string };

export const Route = createFileRoute("/rebrand-studio")({
  head: () => ({ meta: [{ title: "Rebrand Studio — DigiFormation" }] }),
  validateSearch: (search: Record<string, unknown>): StudioSearch => ({
    serviceId: typeof search.serviceId === "string" ? search.serviceId : undefined,
  }),
  component: RebrandStudio,
});

const categories = ["All", ...CREATIVE_CATEGORIES] as const;
type Category = (typeof categories)[number];

function RebrandStudio() {
  const { serviceId } = Route.useSearch();
  const { profile } = usePartnerProfile();
  const { data: creatives } = useAdminCreatives();
  const { data: services } = useServices({ includeInactive: true });
  const { log: logAi } = useAIUsage();
  const { create: saveGeneratedCreative } = useGeneratedCreatives();
  const run = useServerFn(generateRebrandBundle);

  const [tab, setTab] = useState<"studio" | "history">("studio");
  const [showBranded, setShowBranded] = useState(true);

  const contextService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId],
  );
  const initialCategory: Category = useMemo(() => {
    const c = creativeCategoryForService(contextService?.name);
    return (categories as readonly string[]).includes(c) ? (c as Category) : "All";
  }, [contextService]);

  const [category, setCategory] = useState<Category>(initialCategory);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCategory(initialCategory);
    setSelectedId(null);
  }, [initialCategory]);

  const filtered = useMemo(
    () => (category === "All" ? creatives : creatives.filter((c) => c.category === category)),
    [category, creatives],
  );
  const selected = useMemo<AdminCreative | null>(
    () => filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? creatives[0] ?? null,
    [selectedId, filtered, creatives],
  );

  // Partner brand is the SINGLE source of truth — pulled directly from profile.
  const social = (profile?.social_links ?? {}) as Record<string, string>;
  const partnerBrand = {
    brandName: profile?.brand_name ?? "",
    logoUrl: profile?.logo_url ?? null,
    whatsapp: profile?.whatsapp ?? "",
    email: profile?.email ?? "",
    website: profile?.website ?? "",
    primary: profile?.primary_color ?? "#22d3ee",
    secondary: profile?.secondary_color ?? "#a78bfa",
    facebook: social.facebook ?? "",
    instagram: social.instagram ?? "",
    linkedin: social.linkedin ?? "",
  };

  type Status = "idle" | "running" | "done" | "error";
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RebrandBundleResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2400);
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
    setResult(null);
  };

  async function generate() {
    if (!selected || !partnerBrand.brandName) return;
    setStatus("running");
    setError(null);
    setResult(null);
    try {
      const res = await run({
        data: {
          brand: {
            brandName: partnerBrand.brandName,
            whatsapp: partnerBrand.whatsapp,
            email: partnerBrand.email,
            website: partnerBrand.website,
            primary: partnerBrand.primary,
            secondary: partnerBrand.secondary,
            facebook: partnerBrand.facebook || undefined,
            instagram: partnerBrand.instagram || undefined,
            linkedin: partnerBrand.linkedin || undefined,
          },
          sourceImageUrl: selected.image_url ?? undefined,
          serviceName: selected.service_name ?? contextService?.name,
          serviceCategory: selected.category,
          creativeTitle: selected.title,
          creativeTagline: selected.tagline,
          masterMessage: selected.master_message,
        },
      });
      setResult({
        title: res.title,
        headline: res.headline ?? "",
        caption: res.caption,
        cta: res.cta ?? "",
        description: res.description,
        hashtags: res.hashtags,
        external_prompt: res.external_prompt ?? "",
      });
      setStatus("done");
      logAi({ provider: "lovable", model: "google/gemini-2.5-flash", success: true });
      // Persist to generated_creatives so it shows up in Rebrand History.
      try {
        await saveGeneratedCreative({
          source_creative_id: selected.id,
          output_image_url: "",
          platform: "generic",
          size: "1080x1080",
          mode: "ai_smart",
          title: res.title ?? null,
          headline: res.headline ?? null,
          cta: res.cta ?? null,
          caption: res.caption ?? null,
          description: res.description ?? null,
          hashtags: res.hashtags ?? [],
          external_prompt: res.external_prompt ?? null,
          service_id: contextService?.id ?? null,
          style_version: "v1",
        });
      } catch (saveErr) {
        // Non-fatal: bundle is still usable even if history save fails.
        console.warn("Failed to save rebrand history:", saveErr);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bundle generation failed";
      setError(msg);
      setStatus("error");
      logAi({ provider: "lovable", model: "google/gemini-2.5-flash", success: false, error_message: msg });
    }
  }

  return (
    <AppLayout
      title="Rebrand Studio"
      subtitle="Pick a DigiFormation creative → generate a partner-branded caption pack → finish the image in your favourite external AI tool"
    >
      <PartnerProfileGate>
        {contextService && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm flex flex-wrap items-center gap-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>
              Creating a promo for{" "}
              <strong className="text-foreground">{contextService.name}</strong>{" "}
              <span className="text-muted-foreground">— {contextService.category} preselected.</span>
            </span>
          </div>
        )}

        {/* Debug brand badges — always visible so testers can verify mapping */}
        <div className="mb-4 grid sm:grid-cols-2 gap-2">
          <div className="rounded-xl border border-border/60 bg-foreground/[0.03] px-3 py-2 text-xs flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] uppercase tracking-wider">Reference Brand</Badge>
            <span className="text-muted-foreground">DigiFormation</span>
          </div>
          <div className="rounded-xl border border-primary/40 bg-primary/5 px-3 py-2 text-xs flex items-center gap-2">
            <Badge className="text-[9px] uppercase tracking-wider">Target Brand</Badge>
            <span className="font-semibold text-foreground truncate">{partnerBrand.brandName || "—"}</span>
          </div>
        </div>

        {/* Tabs — Studio / History */}
        <div className="mb-4 inline-flex rounded-xl border border-border/60 bg-foreground/[0.03] p-1">
          {([
            { id: "studio", label: "Studio" },
            { id: "history", label: "History" },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition",
                tab === t.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "history" ? (
          <RebrandHistoryPanel
            onStartRebranding={() => setTab("studio")}
            contact={{
              brandName: partnerBrand.brandName,
              email: partnerBrand.email,
              website: partnerBrand.website,
              whatsapp: partnerBrand.whatsapp,
            }}
          />
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4">
          {/* LEFT — Reference library */}
          <section>
            <Panel title="Reference Library" description="DigiFormation creatives">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-medium transition",
                      category === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/[0.05] text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
                  <ImageIc className="h-5 w-5 text-muted-foreground mx-auto" />
                  <p className="mt-2 text-xs text-muted-foreground">No creatives in this category.</p>
                </div>
              ) : (
                <ul className="grid grid-cols-2 gap-2">
                  {filtered.map((c) => {
                    const active = c.id === selected?.id;
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => { setSelectedId(c.id); reset(); }}
                          className={cn(
                            "w-full text-left rounded-xl overflow-hidden border transition",
                            active
                              ? "border-primary ring-2 ring-primary/40"
                              : "border-border/60 hover:border-border",
                          )}
                        >
                          <div className="aspect-square bg-foreground/[0.05]">
                            {c.image_url ? (
                              <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : null}
                          </div>
                          <div className="p-2">
                            <div className="text-[11px] font-medium truncate">{c.title}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{c.category}</div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </section>

          {/* CENTER — Workflow */}
          <section className="space-y-4">
            {/* A. Selected Reference Creative Preview */}
            <Panel
              title="Selected Reference Creative"
              description={selected?.title ?? "Pick a creative on the left to begin"}
              action={
                selected?.image_url ? (
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                    <a href={selected.image_url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-3.5 w-3.5 mr-1" /> Download reference
                    </a>
                  </Button>
                ) : null
              }
            >
              {selected ? (
                <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-start">
                  <div className="rounded-xl overflow-hidden bg-foreground/[0.04] border border-border/40 relative">
                    {selected.image_url ? (
                      <>
                        <img
                          src={selected.image_url}
                          alt={selected.title}
                          className="w-full max-h-[420px] object-contain transition-opacity duration-300"
                        />
                        {/* Branded overlay (cross-fade between raw / branded) */}
                        <div
                          className={cn(
                            "absolute inset-x-0 bottom-0 transition-opacity duration-300 pointer-events-none",
                            showBranded ? "opacity-100" : "opacity-0",
                          )}
                        >
                          <div
                            className="px-3 py-2.5 flex items-center gap-2.5 backdrop-blur-md"
                            style={{
                              background: `linear-gradient(90deg, ${partnerBrand.primary}cc, ${partnerBrand.secondary}cc)`,
                            }}
                          >
                            <div className="h-8 w-8 rounded-lg bg-white/95 flex items-center justify-center overflow-hidden shrink-0">
                              {partnerBrand.logoUrl ? (
                                <img src={partnerBrand.logoUrl} alt="" className="h-full w-full object-contain" />
                              ) : (
                                <Building2 className="h-4 w-4 text-foreground" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 text-white">
                              <div className="text-xs font-bold truncate drop-shadow">
                                {partnerBrand.brandName || "Your Brand"}
                              </div>
                              <div className="text-[10px] opacity-90 truncate drop-shadow">
                                {partnerBrand.whatsapp || partnerBrand.email || partnerBrand.website}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Toggle pill */}
                        <button
                          onClick={() => setShowBranded((v) => !v)}
                          className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur px-2.5 py-1 text-[10px] font-medium text-white border border-white/15 hover:bg-black/80 transition"
                          aria-label="Toggle branded preview"
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", showBranded ? "bg-emerald-400" : "bg-white/40")} />
                          {showBranded ? "With branding" : "Original"}
                        </button>
                      </>
                    ) : (
                      <div className="aspect-square flex items-center justify-center text-muted-foreground text-xs">
                        No reference image
                      </div>
                    )}
                  </div>
                  <div className="text-xs space-y-1.5 sm:max-w-[200px]">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Service</div>
                    <div className="font-medium">{selected.service_name || selected.category}</div>
                    {selected.tagline && (
                      <p className="text-muted-foreground leading-relaxed">{selected.tagline}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 p-10 text-center">
                  <ImageIc className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="mt-2 text-sm text-muted-foreground">No reference creatives available.</p>
                </div>
              )}
            </Panel>

            {/* B. Partner Brand Card — YOUR BRAND */}
            <Panel
              title="Your Brand (Target)"
              description="These details replace DigiFormation branding in the master prompt."
              action={
                <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                  <Link to="/partner-profile">Edit profile</Link>
                </Button>
              }
            >
              <div className="grid sm:grid-cols-[auto_1fr] gap-4 items-start">
                <div className="h-16 w-16 rounded-2xl bg-foreground/[0.06] border border-border/60 overflow-hidden flex items-center justify-center shrink-0">
                  {partnerBrand.logoUrl ? (
                    <img src={partnerBrand.logoUrl} alt={partnerBrand.brandName} className="h-full w-full object-contain" />
                  ) : (
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold truncate">
                    {partnerBrand.brandName || "—"}
                  </div>
                  <ul className="mt-2 grid sm:grid-cols-2 gap-y-1 gap-x-3 text-xs">
                    <BrandRow icon={<Phone className="h-3 w-3" />} value={partnerBrand.whatsapp} />
                    <BrandRow icon={<Mail className="h-3 w-3" />} value={partnerBrand.email} />
                    <BrandRow icon={<Facebook className="h-3 w-3" />} value={partnerBrand.facebook} />
                    <BrandRow icon={<Instagram className="h-3 w-3" />} value={partnerBrand.instagram} />
                    {partnerBrand.website && (
                      <BrandRow icon={<Globe className="h-3 w-3" />} value={partnerBrand.website} />
                    )}
                  </ul>
                </div>
              </div>
            </Panel>

            {/* C. Generate button + status */}
            <Panel>
              {status === "idle" && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="font-display text-sm font-semibold">Generate Rebrand Bundle</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      AI drafts a partner-branded headline, caption, CTA, hashtags and a copy-ready master prompt for any external AI tool.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={generate}
                    disabled={!selected || !partnerBrand.brandName}
                    className="bg-ai text-ai-foreground hover:bg-ai/90 shadow-[var(--shadow-ai-glow)]"
                  >
                    <Wand2 className="h-4 w-4 mr-1.5" /> Generate Bundle
                  </Button>
                </div>
              )}

              {status === "running" && (
                <div className="flex items-center gap-3 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-ai" />
                  <span>Drafting your partner-branded caption and master prompt…</span>
                </div>
              )}

              {status === "error" && (
                <div className="space-y-3">
                  <div className="text-sm text-destructive font-medium">Generation failed</div>
                  <p className="text-xs text-muted-foreground">{error}</p>
                  <Button size="sm" variant="outline" onClick={generate}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Retry
                  </Button>
                </div>
              )}

              {status === "done" && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <ShieldCheck className="h-4 w-4" /> Bundle ready — copy each block below, or copy the full master prompt.
                  <Button variant="ghost" size="sm" onClick={reset} className="ml-auto text-xs">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                  </Button>
                </div>
              )}
            </Panel>

            {/* D. Generated bundle + master prompt + tool cards + 12-step guide */}
            {status === "done" && result && (
              <RebrandBundlePanel
                result={result}
                brand={{
                  brandName: partnerBrand.brandName,
                  email: partnerBrand.email,
                  website: partnerBrand.website,
                  whatsapp: partnerBrand.whatsapp,
                  primary: partnerBrand.primary,
                  secondary: partnerBrand.secondary,
                  facebook: partnerBrand.facebook || undefined,
                  instagram: partnerBrand.instagram || undefined,
                  linkedin: partnerBrand.linkedin || undefined,
                }}
                serviceName={selected?.service_name ?? contextService?.name}
                referenceCreativeUrl={selected?.image_url ?? undefined}
                onFlash={flash}
              />
            )}

            {toast && (
              <div className="text-xs rounded-lg bg-success/15 text-success border border-success/30 px-3 py-2 inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" /> {toast}
              </div>
            )}
          </section>
        </div>
        )}

      </PartnerProfileGate>
    </AppLayout>
  );
}

function BrandRow({ icon, value }: { icon: React.ReactNode; value?: string }) {
  return (
    <li className="flex items-center gap-1.5 min-w-0">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className={cn("truncate", value ? "" : "text-muted-foreground")}>
        {value || "—"}
      </span>
    </li>
  );
}
