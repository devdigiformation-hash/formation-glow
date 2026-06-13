// =============================================================================
// PartnerProfileGate
// Blocks Rebrand Studio (AI rebrand, external prompts, distribution) until the
// partner profile has every required brand field. Admins bypass entirely.
// =============================================================================
import { Link } from "@tanstack/react-router";
import { Lock, CheckCircle2, AlertTriangle, UserCog } from "lucide-react";
import { Panel } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { usePartnerProfile } from "@/lib/data";
import { useAuth } from "@/lib/auth/context";

export type ProfileField =
  | "full_name" | "brand_name" | "logo_url" | "whatsapp" | "email"
  | "facebook" | "instagram";

export const REQUIRED_FIELDS: { key: ProfileField; label: string }[] = [
  { key: "full_name", label: "Full Name" },
  { key: "brand_name", label: "Brand Name" },
  { key: "logo_url", label: "Logo" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "facebook", label: "Facebook Page URL" },
  { key: "instagram", label: "Instagram URL" },
];

const isNonEmpty = (v: unknown) => typeof v === "string" && v.trim() !== "";
const isFacebookUrl = (v: unknown) =>
  isNonEmpty(v) && /^(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/i.test(String(v).trim());
const isInstagramUrl = (v: unknown) =>
  isNonEmpty(v) && /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i.test(String(v).trim());

export function getMissingProfileFields(profile: any | null | undefined): ProfileField[] {
  if (!profile) return REQUIRED_FIELDS.map((f) => f.key);
  const social = (profile.social_links ?? {}) as Record<string, string>;
  const checks: Record<ProfileField, boolean> = {
    full_name: isNonEmpty(profile.full_name),
    brand_name: isNonEmpty(profile.brand_name),
    logo_url: isNonEmpty(profile.logo_url),
    whatsapp: isNonEmpty(profile.whatsapp),
    email: isNonEmpty(profile.email),
    facebook: isFacebookUrl(social.facebook),
    instagram: isInstagramUrl(social.instagram),
  };
  return REQUIRED_FIELDS.filter(({ key }) => !checks[key]).map(({ key }) => key);
}

export function PartnerProfileGate({ children }: { children: React.ReactNode }) {
  const { profile } = usePartnerProfile();
  const { isAdmin } = useAuth();
  const missing = getMissingProfileFields(profile);

  if (isAdmin || missing.length === 0) return <>{children}</>;

  const missingSet = new Set(missing);

  return (
    <Panel
      title="Complete your partner profile to unlock Rebrand Studio"
      description="DigiFormation needs your full brand identity before generating partner-safe creatives."
    >
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base font-semibold">Studio locked</h3>
            <p className="text-xs text-muted-foreground mt-1">
              AI Smart Rebrand, external AI prompts and the distribution workflow
              stay locked until every required brand field below is filled. This
              keeps your generated captions, contact info and master prompts safe
              for your own audience — not DigiFormation's.
            </p>
          </div>
        </div>

        <ul className="mt-4 grid sm:grid-cols-2 gap-2">
          {REQUIRED_FIELDS.map((f) => {
            const isMissing = missingSet.has(f.key);
            return (
              <li
                key={f.key}
                className={
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs " +
                  (isMissing
                    ? "border-amber-500/40 bg-amber-500/10 text-foreground"
                    : "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground")
                }
              >
                {isMissing ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
                <span className={isMissing ? "font-medium" : "line-through"}>{f.label}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link to="/partner-profile">
              <UserCog className="h-4 w-4 mr-1.5" /> Complete Partner Profile
            </Link>
          </Button>
          <span className="text-[11px] text-muted-foreground">
            {missing.length} of {REQUIRED_FIELDS.length} field
            {missing.length === 1 ? "" : "s"} still missing
          </span>
        </div>
      </div>
    </Panel>
  );
}
