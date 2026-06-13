import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  UserCircle, Mail, Phone, Globe, Building2, Upload, Check, Sparkles,
  Instagram, Facebook, Linkedin, Youtube, Twitter, Music2,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePartnerProfile } from "@/lib/data";
import { useAuth } from "@/lib/auth/context";
import { uploadPartnerLogo } from "@/lib/storage";
import { getMissingProfileFields, REQUIRED_FIELDS } from "@/components/partner-profile-gate";


export const Route = createFileRoute("/partner-profile")({
  head: () => ({ meta: [{ title: "Brand Profile — DigiFormation" }] }),
  component: PartnerProfile,
});

type SocialKey = "instagram" | "facebook" | "linkedin" | "tiktok" | "x" | "youtube";

const SOCIAL_FIELDS: { key: SocialKey; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", icon: <Instagram className="h-3.5 w-3.5" />, placeholder: "https://instagram.com/yourbrand" },
  { key: "facebook", label: "Facebook", icon: <Facebook className="h-3.5 w-3.5" />, placeholder: "https://facebook.com/yourbrand" },
  { key: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-3.5 w-3.5" />, placeholder: "https://linkedin.com/company/yourbrand" },
  { key: "tiktok", label: "TikTok", icon: <Music2 className="h-3.5 w-3.5" />, placeholder: "https://tiktok.com/@yourbrand" },
  { key: "x", label: "X / Twitter", icon: <Twitter className="h-3.5 w-3.5" />, placeholder: "https://x.com/yourbrand" },
  { key: "youtube", label: "YouTube", icon: <Youtube className="h-3.5 w-3.5" />, placeholder: "https://youtube.com/@yourbrand" },
];



function PartnerProfile() {
  const { profile, save } = usePartnerProfile();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState({
    full_name: "",
    brand_name: "",
    logo_url: null as string | null,
    whatsapp: "",
    email: "",
    website: "",
    primary_color: "#22d3ee",
    secondary_color: "#a78bfa",
    social_links: {} as Record<string, string>,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDraft({
      full_name: profile.full_name ?? "",
      brand_name: profile.brand_name ?? "",
      logo_url: profile.logo_url ?? null,
      whatsapp: profile.whatsapp ?? "",
      email: profile.email ?? "",
      website: profile.website ?? "",
      primary_color: profile.primary_color ?? "#22d3ee",
      secondary_color: profile.secondary_color ?? "#a78bfa",
      social_links: (profile.social_links ?? {}) as Record<string, string>,
    });
  }, [profile]);

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setSaved(false);
  };
  const setSocial = (k: SocialKey, v: string) => {
    setDraft((d) => ({ ...d, social_links: { ...d.social_links, [k]: v } }));
    setSaved(false);
  };

  const handleLogo = async (file?: File | null) => {
    if (!file || !user) return;
    try {
      const url = await uploadPartnerLogo(user.id, file);
      set("logo_url", url);
    } catch (e) {
      console.error("logo upload failed", e);
    }
  };

  const handleSave = () => {
    save({
      full_name: draft.full_name,
      brand_name: draft.brand_name,
      logo_url: draft.logo_url,
      whatsapp: draft.whatsapp,
      email: draft.email,
      website: draft.website || null,
      primary_color: draft.primary_color,
      secondary_color: draft.secondary_color,
      social_links: draft.social_links,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = (draft.brand_name || draft.full_name || "Y B")
    .split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").slice(0, 2).join("") || "YB";

  // Completion logic mirrors partner-profile-gate.tsx exactly so the % shown
  // here always agrees with the Rebrand Studio gate (incl. FB/IG URL validation).
  const gateProfile = {
    full_name: draft.full_name,
    brand_name: draft.brand_name,
    logo_url: draft.logo_url,
    whatsapp: draft.whatsapp,
    email: draft.email,
    social_links: draft.social_links,
  };
  const missingFields = getMissingProfileFields(gateProfile);
  const completionPct = Math.round(
    ((REQUIRED_FIELDS.length - missingFields.length) / REQUIRED_FIELDS.length) * 100,
  );

  return (
    <AppLayout
      title="Brand Profile"
      subtitle="Your permanent brand identity — reused on every rebrand"
      actions={
        <div className="flex items-center gap-2 rounded-full bg-foreground/[0.04] border border-border/60 pl-1 pr-3 py-1">
          <div className="relative h-9 w-9">
            <svg width={36} height={36} viewBox="0 0 36 36" className="-rotate-90">
              <circle cx={18} cy={18} r={15} stroke="currentColor" strokeOpacity={0.12} strokeWidth={3} fill="none" />
              <circle
                cx={18} cy={18} r={15}
                stroke="url(#pp-grad)" strokeWidth={3} strokeLinecap="round" fill="none"
                strokeDasharray={2 * Math.PI * 15}
                strokeDashoffset={2 * Math.PI * 15 * (1 - completionPct / 100)}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="pp-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center text-[10px] font-bold tabular">{completionPct}%</div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">Complete</span>
        </div>
      }
    >
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-5">
        {/* Brand card preview */}
        <Panel className="text-center">
          <div
            className="h-24 w-24 mx-auto rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-primary-foreground overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${draft.primary_color}, ${draft.secondary_color})`,
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {draft.logo_url ? (
              <img src={draft.logo_url} alt="logo" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">{draft.brand_name || "Your Brand"}</h2>
          <p className="text-xs text-muted-foreground">{draft.full_name || "Partner"}</p>

          <div className="mt-5 space-y-2 text-sm text-left">
            {draft.email && <div className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 text-muted-foreground" /> {draft.email}</div>}
            {draft.whatsapp && <div className="flex items-center gap-2 truncate"><Phone className="h-4 w-4 text-muted-foreground" /> {draft.whatsapp}</div>}
            {draft.website && <div className="flex items-center gap-2 truncate"><Globe className="h-4 w-4 text-muted-foreground" /> {draft.website}</div>}
          </div>


          <div className="mt-4 rounded-lg bg-foreground/[0.03] border border-border/60 p-3 text-left">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-ai mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Memory
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Rebrand Studio remembers this profile and reuses your logo, contact info, brand colors and links on every future rebrand — Quick or AI Smart.
            </p>
          </div>
        </Panel>

        {/* Editor */}
        <div className="space-y-5">
          <Panel title="Brand identity" description="Logo, brand name and partner name">
            <div className="mb-4">
              <Label className="text-xs">Logo</Label>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-16 w-16 rounded-xl border border-border/60 bg-foreground/[0.04] flex items-center justify-center overflow-hidden shrink-0">
                  {draft.logo_url ? (
                    <img src={draft.logo_url} alt="logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogo(e.target.files?.[0])} />
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="w-full">
                    <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload logo
                  </Button>
                  <p className="text-[10px] text-muted-foreground mt-1">PNG with transparent background works best.</p>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Brand name"><Input value={draft.brand_name} onChange={(e) => set("brand_name", e.target.value)} className="bg-foreground/[0.03]" /></Field>
              <Field label="Your full name" icon={<UserCircle className="h-3.5 w-3.5" />}><Input value={draft.full_name} onChange={(e) => set("full_name", e.target.value)} className="bg-foreground/[0.03] pl-8" /></Field>
            </div>
          </Panel>

          <Panel title="Contact info" description="Shown on every rebranded creative">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="WhatsApp" icon={<Phone className="h-3.5 w-3.5" />}><Input value={draft.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="bg-foreground/[0.03] pl-8" /></Field>
              <Field label="Email" icon={<Mail className="h-3.5 w-3.5" />}><Input type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} className="bg-foreground/[0.03] pl-8" /></Field>
              <Field label="Website" icon={<Globe className="h-3.5 w-3.5" />}><Input value={draft.website} onChange={(e) => set("website", e.target.value)} className="bg-foreground/[0.03] pl-8" /></Field>
            </div>
          </Panel>

          <Panel title="Social links" description="Optional — used in marketing captions">
            <div className="grid sm:grid-cols-2 gap-4">
              {SOCIAL_FIELDS.map((s) => (
                <Field key={s.key} label={s.label} icon={s.icon}>
                  <Input
                    value={draft.social_links[s.key] ?? ""}
                    onChange={(e) => setSocial(s.key, e.target.value)}
                    placeholder={s.placeholder}
                    className="bg-foreground/[0.03] pl-8 text-xs"
                  />
                </Field>
              ))}
            </div>
          </Panel>


          <div className="flex justify-end">
            <Button size="lg" onClick={handleSave}>
              {saved ? (<><Check className="h-4 w-4 mr-1.5" /> Saved</>) : (<><Sparkles className="h-4 w-4 mr-1.5" /> Save brand profile</>)}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="relative mt-1.5">
        {icon && (<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>)}
        {children}
      </div>
    </div>
  );
}

