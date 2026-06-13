import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Facebook, Instagram, Linkedin, ExternalLink, Copy, Image as ImageIc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui-bits";
import { PLATFORMS } from "@/lib/external-prompts";
import { fetchPublishingContext, parseKnowledgeJson, type PublishingContext } from "@/lib/knowledge.functions";

type Props = {
  caption?: string;
  hashtags?: string[];
  partnerWebsite?: string;
  serviceSlug?: string;
  onFlash?: (m: string) => void;
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  pinterest: ImageIc,
};

export function DistributionPanel({ caption = "", hashtags = [], partnerWebsite, serviceSlug, onFlash }: Props) {
  const fullText = [caption, hashtags.join(" ")].filter(Boolean).join("\n\n");
  const fetchPub = useServerFn(fetchPublishingContext);

  // Load DB-driven publishing guidance (platform tips + Facebook ads).
  // Safe fallback: empty context — static PLATFORMS tips still render below.
  const { data: pub } = useQuery({
    queryKey: ["publishing-ctx", serviceSlug ?? null],
    queryFn: async () => {
      try {
        const payload = await fetchPub({ data: { serviceSlug } });
        return parseKnowledgeJson<PublishingContext>(payload);
      } catch {
        return { guides: [], facebook_ads: [] } as PublishingContext;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const guideFor = (platformId: string) =>
    pub?.guides.find((g) => g.platform.toLowerCase() === platformId.toLowerCase());

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      onFlash?.("Caption + hashtags copied");
    } catch {
      onFlash?.("Copy failed");
    }
  };

  return (
    <Panel
      title="Publish & Distribute"
      description="Download the image, then post to each platform. Tap the share link to open a pre-filled composer where supported."
    >
      <div className="grid sm:grid-cols-2 gap-3">
        {PLATFORMS.map((p) => {
          const Icon = ICONS[p.id] ?? ExternalLink;
          const shareHref = p.shareUrl(fullText, partnerWebsite);
          const guide = guideFor(p.id);
          return (
            <div key={p.id} className="rounded-xl border border-border/60 bg-foreground/[0.02] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-4 w-4" />
                <div className="font-display font-semibold text-sm">{p.label}</div>
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-0.5 mb-2.5">
                <li>📐 {guide?.best_format || p.imageSize}</li>
                <li>✍️ {p.captionTip}</li>
                <li>#️⃣ {guide?.hashtag_strategy || p.hashtagTip}</li>
                {guide?.title && <li className="text-foreground/80">💡 {guide.title}</li>}
              </ul>
              {shareHref ? (
                <Button asChild size="sm" variant="outline" className="w-full h-8 text-xs">
                  <a href={shareHref} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" /> Share to {p.label}
                  </a>
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={copyAll}>
                  <Copy className="h-3 w-3 mr-1" /> Copy caption — upload manually
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {pub && pub.facebook_ads.length > 0 && (
        <div className="mt-3 rounded-xl border border-border/60 bg-foreground/[0.02] p-3 text-[11px] text-muted-foreground">
          <div className="font-display font-semibold text-foreground text-xs mb-1">Facebook Ads guidance</div>
          <ul className="space-y-0.5">
            {pub.facebook_ads.slice(0, 3).map((f) => (
              <li key={f.id}>
                🎯 {f.objective || "Awareness"} · CTA: {f.cta_button || "Learn More"} · Budget: {f.budget_guidance || "Test £5/day"}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Button size="sm" variant="ghost" className="mt-3 w-full text-xs" onClick={copyAll}>
        <Copy className="h-3 w-3 mr-1.5" /> Copy caption + hashtags bundle
      </Button>
    </Panel>
  );
}
