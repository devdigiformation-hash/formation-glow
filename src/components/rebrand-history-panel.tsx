// =============================================================================
// RebrandHistoryPanel — partner-scoped list of previously generated rebrand
// bundles (reads `generated_creatives` via useGeneratedCreatives, RLS-enforced).
//
// Compact mobile-friendly cards + a Dialog detail view with copy buttons for
// every section (headline / caption / cta / hashtags / full post / master
// prompt / contact info). Empty state CTA hands the partner back to the
// Studio tab.
// =============================================================================
import { useMemo, useState } from "react";
import {
  Copy, Check, Image as ImageIc, Eye, Calendar, Tag, Sparkles,
  Megaphone, MessageSquare, Wand2, Hash, Mail, Globe, Phone, Layers, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui-bits";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useGeneratedCreatives, useAdminCreatives, useServices } from "@/lib/data";
import type { GeneratedCreative } from "@/lib/data/types";

type ContactInfo = {
  brandName?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
};

export function RebrandHistoryPanel({
  onStartRebranding,
  contact,
}: {
  onStartRebranding: () => void;
  contact: ContactInfo;
}) {
  const { data: history, remove } = useGeneratedCreatives();
  const { data: creatives } = useAdminCreatives({ includeArchived: true });
  const { data: services } = useServices({ includeInactive: true });

  const sorted = useMemo(
    () => [...history].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [history],
  );

  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const open = sorted.find((h) => h.id === openId) ?? null;

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };

  const refFor = (g: GeneratedCreative) =>
    creatives.find((c) => c.id === g.source_creative_id) ?? null;
  const svcFor = (g: GeneratedCreative) =>
    g.service_id ? services.find((s) => s.id === g.service_id) ?? null : null;

  if (sorted.length === 0) {
    return (
      <Panel title="Rebrand History" description="Your generated bundles will appear here.">
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
          <Sparkles className="h-6 w-6 text-muted-foreground mx-auto" />
          <p className="mt-3 text-sm font-medium">No rebrands yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Select a creative and generate your first partner-branded bundle.
          </p>
          <Button size="sm" className="mt-4" onClick={onStartRebranding}>
            Start Rebranding
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <Panel
        title="Rebrand History"
        description="Your previously generated partner-branded bundles."
        action={
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {sorted.length} saved
          </Badge>
        }
      >
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((g) => {
            const ref = refFor(g);
            const svc = svcFor(g);
            return (
              <li
                key={g.id}
                className="rounded-xl border border-border/60 bg-foreground/[0.02] p-3 flex flex-col gap-3 min-w-0"
              >
                <div className="flex gap-3 min-w-0">
                  <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-foreground/[0.06] border border-border/40 flex items-center justify-center">
                    {ref?.image_url ? (
                      <img
                        src={ref.image_url}
                        alt={ref.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIc className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span className="truncate">{svc?.name ?? ref?.service_name ?? ref?.category ?? "Untitled service"}</span>
                    </div>
                    <p className="text-sm font-semibold break-words line-clamp-2">
                      {g.headline || g.title || "(no headline)"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground break-words line-clamp-2">
                      {g.caption || g.description || "—"}
                    </p>
                  </div>
                </div>

                {g.cta && (
                  <div className="text-[11px] inline-flex items-center gap-1 text-foreground/80 break-words">
                    <Wand2 className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="line-clamp-1">{g.cta}</span>
                  </div>
                )}

                {g.hashtags.length > 0 && (
                  <div className="text-[10px] text-muted-foreground break-words line-clamp-2">
                    {g.hashtags.slice(0, 8).join(" ")}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(g.created_at).toLocaleDateString()}
                  </span>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                    {g.style_version || "v1"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <CopyBtn
                    label="Post"
                    text={buildFullPost(g, contact)}
                    onDone={() => flash("Full post copied")}
                  />
                  <CopyBtn
                    label="Prompt"
                    text={g.external_prompt ?? ""}
                    disabled={!g.external_prompt}
                    onDone={() => flash("Master prompt copied")}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-[11px]"
                    onClick={() => setOpenId(g.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> Open
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        {toast && (
          <div className="mt-3 text-xs rounded-lg bg-success/15 text-success border border-success/30 px-3 py-2 inline-flex items-center gap-2">
            <Check className="h-3.5 w-3.5" /> {toast}
          </div>
        )}
      </Panel>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="break-words">
                  {open.headline || open.title || "Rebrand details"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Saved {new Date(open.created_at).toLocaleString()} · Style {open.style_version || "v1"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 mt-2">
                {refFor(open)?.image_url && (
                  <DetailSection title="Reference image" icon={<ImageIc className="h-3.5 w-3.5" />}>
                    <div className="rounded-xl overflow-hidden border border-border/40 bg-foreground/[0.04]">
                      <img
                        src={refFor(open)!.image_url!}
                        alt={refFor(open)!.title}
                        className="w-full max-h-64 object-contain"
                      />
                    </div>
                  </DetailSection>
                )}

                <DetailCopy
                  title="Headline" icon={<Megaphone className="h-3.5 w-3.5" />}
                  text={open.headline || "—"} onCopied={() => flash("Headline copied")}
                />
                <DetailCopy
                  title="Caption" icon={<MessageSquare className="h-3.5 w-3.5" />} pre
                  text={open.caption || open.description || "—"} onCopied={() => flash("Caption copied")}
                />
                <DetailCopy
                  title="CTA" icon={<Wand2 className="h-3.5 w-3.5" />}
                  text={open.cta || "—"} onCopied={() => flash("CTA copied")}
                />
                <DetailCopy
                  title="Hashtags" icon={<Hash className="h-3.5 w-3.5" />}
                  text={open.hashtags.join(" ") || "—"} onCopied={() => flash("Hashtags copied")}
                />
                <DetailCopy
                  title="Full post bundle" icon={<Layers className="h-3.5 w-3.5" />} pre
                  text={buildFullPost(open, contact)} onCopied={() => flash("Full post copied")}
                />
                <DetailCopy
                  title="External AI master prompt" icon={<FileText className="h-3.5 w-3.5" />} pre
                  text={open.external_prompt || "(not saved)"}
                  onCopied={() => flash("Master prompt copied")}
                  disabled={!open.external_prompt}
                />

                <DetailSection title="Partner contact (auto-attached)" icon={<Mail className="h-3.5 w-3.5" />}>
                  <div className="rounded-xl p-3 bg-foreground/[0.04] border border-border/40 text-xs space-y-1">
                    {contact.brandName && (
                      <div className="font-semibold">{contact.brandName}</div>
                    )}
                    <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" /> {contact.email || "—"}</div>
                    <div className="flex items-center gap-2"><Globe className="h-3 w-3 text-muted-foreground" /> {contact.website || "—"}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-muted-foreground" /> {contact.whatsapp || "—"}</div>
                  </div>
                </DetailSection>

                <div className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm("Delete this saved rebrand?")) {
                        remove(open.id);
                        setOpenId(null);
                        flash("Deleted");
                      }
                    }}
                  >
                    Delete
                  </Button>
                  <Button size="sm" onClick={() => setOpenId(null)}>Close</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function buildFullPost(g: GeneratedCreative, contact: ContactInfo): string {
  const contactBlock = [
    contact.email && `📧 ${contact.email}`,
    contact.website && `🌐 ${contact.website}`,
    contact.whatsapp && `📲 ${contact.whatsapp}`,
  ].filter(Boolean).join("\n");
  return [
    g.headline,
    g.caption || g.description,
    g.cta,
    contactBlock,
    g.hashtags.join(" "),
  ].filter((s) => s && String(s).trim().length > 0).join("\n\n");
}

function CopyBtn({
  label, text, disabled, onDone,
}: { label: string; text: string; disabled?: boolean; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 text-[11px]"
      disabled={disabled}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          onDone();
          setTimeout(() => setCopied(false), 1500);
        } catch {/* ignore */}
      }}
    >
      {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
      {label}
    </Button>
  );
}

function DetailSection({
  title, icon, children,
}: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <details open className="group rounded-xl border border-border/50 bg-foreground/[0.02] [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex items-center gap-2 cursor-pointer px-3 py-2.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
        {icon}{title}
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}

function DetailCopy({
  title, icon, text, pre, disabled, onCopied,
}: {
  title: string; icon?: React.ReactNode; text: string; pre?: boolean;
  disabled?: boolean; onCopied: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <DetailSection title={title} icon={icon}>
      <div className="rounded-xl p-3 bg-foreground/[0.04] border border-border/40">
        <div className="flex items-center justify-end mb-1.5">
          <Button
            size="sm" variant="ghost" className="h-7 px-2 text-[11px]"
            disabled={disabled}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                onCopied();
                setTimeout(() => setCopied(false), 1500);
              } catch {/* ignore */}
            }}
          >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className={cn("text-xs leading-relaxed break-words", pre ? "whitespace-pre-wrap" : "")}>
          {text}
        </div>
      </div>
    </DetailSection>
  );
}
