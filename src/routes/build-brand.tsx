import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles, ArrowRight, ArrowLeft, Check, Copy, RefreshCw, Loader2,
  Wand2, ExternalLink, Upload, Facebook, Instagram, UserCircle,
  CheckCircle2, Languages, Plus, Trash2, Eye, Download, Library,
  Star, Image as ImageIcon, Palette,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  generateBrandNames,
  translateBrandMeanings,
  SUPPORTED_BRAND_LANGUAGES,
  type BrandLanguage,
} from "@/lib/generate-brand-names.functions";
import {
  listBrands, ensureActiveBrandFromProfile, createBrand, deleteBrand, setActiveBrand, type BrandRow,
} from "@/lib/brands.functions";
import { useAuth } from "@/lib/auth/context";
import { uploadPartnerLogo } from "@/lib/storage";

export const Route = createFileRoute("/build-brand")({
  head: () => ({
    meta: [
      { title: "Brand Library — DigiFormation" },
      { name: "description", content: "Create, save, manage and activate unlimited brand identities. The Active Brand drives Rebrand Studio, Marketing Guide and the AI Assistant." },
    ],
  }),
  component: BuildBrandRoute,
});

// =============================================================================
// Themes
// =============================================================================
type Theme = { id: string; label: string; primary: string; secondary: string; accent: string };

const THEMES: Theme[] = [
  { id: "blue",     label: "Blue",     primary: "#000000", secondary: "#FFFFFF", accent: "#2563EB" },
  { id: "cyan",     label: "Cyan",     primary: "#000000", secondary: "#FFFFFF", accent: "#06B6D4" },
  { id: "purple",   label: "Purple",   primary: "#000000", secondary: "#FFFFFF", accent: "#7C3AED" },
  { id: "green",    label: "Green",    primary: "#000000", secondary: "#FFFFFF", accent: "#16A34A" },
  { id: "emerald",  label: "Emerald",  primary: "#000000", secondary: "#FFFFFF", accent: "#059669" },
  { id: "teal",     label: "Teal",     primary: "#000000", secondary: "#FFFFFF", accent: "#0D9488" },
  { id: "gold",     label: "Gold",     primary: "#000000", secondary: "#FFFFFF", accent: "#D4A017" },
  { id: "orange",   label: "Orange",   primary: "#000000", secondary: "#FFFFFF", accent: "#FF7A1A" },
  { id: "red",      label: "Red",      primary: "#000000", secondary: "#FFFFFF", accent: "#DC2626" },
  { id: "navy",     label: "Navy",     primary: "#000000", secondary: "#FFFFFF", accent: "#1E3A8A" },
  { id: "silver",   label: "Silver",   primary: "#000000", secondary: "#FFFFFF", accent: "#A3A3A3" },
  { id: "charcoal", label: "Charcoal", primary: "#000000", secondary: "#FFFFFF", accent: "#374151" },
];

const BRAND_TYPES = [
  { id: "formation",  label: "Formation",  suffix: "Formations" },
  { id: "solutions",  label: "Solutions",  suffix: "Solutions" },
  { id: "services",   label: "Services",   suffix: "Services" },
  { id: "consulting", label: "Consulting", suffix: "Consulting" },
  { id: "other",      label: "Other",      suffix: "Ltd" },
] as const;
type BrandType = typeof BRAND_TYPES[number]["id"];

// =============================================================================
// Logo styles — visual variants the user picks before the prompt is built.
// =============================================================================
type LogoStyle = {
  id: string;
  label: string;
  short: string;
  description: string;
  inspiration: string;
  promptStyleLine: string;
  promptCharacteristics: string;
  preview: "wordmark" | "icon-word" | "lettermark" | "minimal" | "shield" | "ai";
};

const LOGO_STYLES: LogoStyle[] = [
  {
    id: "corporate-wordmark",
    label: "Corporate Wordmark",
    short: "Clean text logo, fintech-grade typography",
    description: "Clean text-only logo. Professional, modern, premium. Mostly typography. Minimal symbol usage.",
    inspiration: "PayPal, Wise, Stripe, Revolut, Monzo",
    promptStyleLine: "Corporate Wordmark — premium fintech-grade text logo, typography led, no icon.",
    promptCharacteristics: "Clean confident sans-serif wordmark, balanced letter spacing, no mascot, no icon.",
    preview: "wordmark",
  },
  {
    id: "icon-wordmark",
    label: "Icon + Wordmark",
    short: "Simple professional icon beside the name",
    description: "Simple professional icon paired with the company name. Modern startup feel for digital businesses.",
    inspiration: "HubSpot, Slack, Airtable, Asana",
    promptStyleLine: "Icon + Wordmark — minimal abstract geometric icon to the left of the company name.",
    promptCharacteristics: "Single simple abstract icon (geometric mark), balanced with clean sans-serif wordmark beside it.",
    preview: "icon-word",
  },
  {
    id: "lettermark",
    label: "Lettermark",
    short: "Stylised initials, premium corporate identity",
    description: "Initials or stylised letters. Strong premium corporate / consulting identity.",
    inspiration: "HSBC, IBM, HP, KPMG",
    promptStyleLine: "Lettermark — stylised initials of the brand presented as the primary mark, with the full company name set below in a smaller refined sans-serif.",
    promptCharacteristics: "Bold, confident initials as the hero element; refined corporate typography for the full name below.",
    preview: "lettermark",
  },
  {
    id: "premium-minimal",
    label: "Premium Minimal",
    short: "Ultra clean, flat, modern",
    description: "Ultra clean, modern, high-end. Minimal geometric styling, flat design.",
    inspiration: "Mercury, Notion, Linear, Vercel",
    promptStyleLine: "Premium Minimal — ultra clean, flat, modern wordmark with optional tiny geometric mark.",
    promptCharacteristics: "Flat design, no 3D, no shadow, perfectly balanced minimal layout, refined modern sans-serif.",
    preview: "minimal",
  },
  {
    id: "business-shield",
    label: "Business Shield",
    short: "Minimal trust / shield symbol",
    description: "Minimal shield or trust symbol paired with the wordmark. Professional, not gaming, not aggressive.",
    inspiration: "Corporate trust & compliance brands",
    promptStyleLine: "Business Shield — minimal flat shield or trust badge mark beside / above the wordmark.",
    promptCharacteristics: "Subtle abstract shield outline, balanced corporate composition, no medieval / gaming styling.",
    preview: "shield",
  },
  {
    id: "ai-recommended",
    label: "Custom AI Recommended",
    short: "Let the AI pick the best style",
    description: "AI selects the most suitable style based on brand type, name, theme colors and industry.",
    inspiration: "Tailored to your brand",
    promptStyleLine: "AI-recommended style — pick the most suitable professional corporate style for this brand and industry.",
    promptCharacteristics: "Choose between corporate wordmark, icon + wordmark, lettermark, premium minimal or business shield based on industry fit.",
    preview: "ai",
  },
];

const TOTAL_STEPS = 11;
const LANG_LS_KEY = "df_brand_language_v1";

// Only strip company endings (Ltd / Limited / etc.) — keep the category word
// (Formation / Solutions / Services / Consulting) as part of the base brand.
const SUFFIX_STRIP_RE = /\s+(Ltd|Limited|Inc|Corp|Group|Capital|Partners|Global|LLC)\.?$/i;
function applySuffix(name: string, suffix: string): string {
  const root = name.replace(SUFFIX_STRIP_RE, "").trim();
  return `${root} ${suffix}`;
}

// Ensure a generated base always carries the chosen category word.
// E.g. "Takova" + Formation -> "Takova Formation"; "Takova Solutions" stays.
function ensureCategoryWord(name: string, category: string): string {
  const cleaned = name.replace(SUFFIX_STRIP_RE, "").trim();
  if (!category) return cleaned;
  const re = new RegExp(`\\b${category}s?\\b\\s*$`, "i");
  if (re.test(cleaned)) {
    // normalize trailing word to exact category spelling
    return cleaned.replace(re, category).replace(/\s+/g, " ").trim();
  }
  // strip any other trailing category word, then append the chosen one
  const stripped = cleaned.replace(/\s+(Formations?|Solutions?|Services?|Consulting)$/i, "").trim();
  return `${stripped} ${category}`;
}

type BrandItem = { name: string; meaning: string };

type CompanyEnding = "" | "Ltd" | "Limited";

type WizardState = {
  step: number;
  brandType: BrandType;
  niche: string;
  names: BrandItem[];
  baseName: string;
  ending: CompanyEnding;
  selectedName: string;
  meaningEn: string;
  meaningUr: string;
  logoStyleId: string;
  themeId: string;
  logoUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  saving: boolean;
};

const DEFAULT_WIZARD: WizardState = {
  step: 1,
  brandType: "formation",
  niche: "",
  names: [],
  baseName: "",
  ending: "Ltd",
  selectedName: "",
  meaningEn: "",
  meaningUr: "",
  logoStyleId: "",
  themeId: "blue",
  logoUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  saving: false,
};

function detectLanguage(): BrandLanguage {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LANG_LS_KEY);
    if (stored && SUPPORTED_BRAND_LANGUAGES.some((l) => l.code === stored)) {
      return stored as BrandLanguage;
    }
  } catch {/* ignore */}
  return "en";
}

// =============================================================================
// Root route
// =============================================================================
function BuildBrandRoute() {
  const [mode, setMode] = useState<"library" | "wizard">("library");
  const [wizard, setWizard] = useState<WizardState>(DEFAULT_WIZARD);

  const startWizard = () => {
    setWizard(DEFAULT_WIZARD);
    setMode("wizard");
  };
  const closeWizard = () => {
    setWizard(DEFAULT_WIZARD);
    setMode("library");
  };

  return (
    <AppLayout
      title={mode === "wizard" ? "Create New Brand" : "Brand Library"}
      subtitle={
        mode === "wizard"
          ? "Step through the brand builder. Your brand is saved at the end."
          : "Create unlimited brands. Activate one to use it across the platform."
      }
      actions={
        mode === "wizard" ? (
          <Button variant="outline" size="sm" onClick={closeWizard}>
            <Library className="h-3.5 w-3.5 mr-1.5" /> Back to library
          </Button>
        ) : (
          <Button size="sm" onClick={startWizard}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New brand
          </Button>
        )
      }
    >
      {mode === "library" ? (
        <BrandLibrary onCreateNew={startWizard} />
      ) : (
        <BrandWizard
          state={wizard}
          setState={setWizard}
          onSaved={closeWizard}
        />
      )}
    </AppLayout>
  );
}

// =============================================================================
// Library view
// =============================================================================
function BrandLibrary({ onCreateNew }: { onCreateNew: () => void }) {
  const fetchBrands = useServerFn(listBrands);
  const ensureProfileBrand = useServerFn(ensureActiveBrandFromProfile);
  const qc = useQueryClient();
  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const rows = await fetchBrands();
      if (rows.some((b) => b.is_active)) return rows;
      const imported = await ensureProfileBrand();
      if (!imported) return rows;
      return [imported, ...rows.filter((b) => b.id !== imported.id)];
    },
  });

  const setActiveFn = useServerFn(setActiveBrand);
  const deleteFn = useServerFn(deleteBrand);

  const activate = useMutation({
    mutationFn: (b: BrandRow) => {
      const theme = THEMES.find((t) => t.id === b.theme);
      return setActiveFn({
        data: {
          id: b.id,
          theme_primary: theme?.primary,
          theme_secondary: theme?.accent,
        },
      });
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success(`${row.name} is now your Active Brand`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to activate"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
  });

  const [viewing, setViewing] = useState<BrandRow | null>(null);
  const [deleting, setDeleting] = useState<BrandRow | null>(null);

  const brands = brandsQuery.data ?? [];
  const active = brands.find((b) => b.is_active) ?? null;
  const others = brands.filter((b) => !b.is_active);

  return (
    <div className="space-y-5">
      {/* Active brand */}
      <Panel
        title="Active Brand"
        description="The brand currently powering Rebrand Studio, Marketing Guide, AI Assistant, Orders and Earnings."
      >
        {brandsQuery.isLoading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading brands…
          </div>
        ) : active ? (
          <ActiveBrandCard brand={active} onView={() => setViewing(active)} onCreateNew={onCreateNew} />
        ) : (
          <div className="text-sm text-muted-foreground">
            No active brand yet. Create a brand and set it as active to drive the rest of the platform.
          </div>
        )}
      </Panel>

      {/* Library */}
      <Panel
        title={`Brand Library${brands.length > 0 ? ` · ${brands.length}` : ""}`}
        description="All brands you've created. Pick any to activate, view, download or delete."
      >
        {brands.length === 0 && !brandsQuery.isLoading ? (
          <div className="text-center py-8 space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-foreground/[0.04] border border-border/60 mx-auto flex items-center justify-center">
              <Library className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground">No brands saved yet.</div>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" /> Create your first brand
            </Button>
          </div>
        ) : others.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-sm text-muted-foreground">
              Your active brand is already connected. Build more brands whenever you want.
            </div>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" /> Build More Brand
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {others.map((b) => (
              <BrandCard
                key={b.id}
                brand={b}
                onView={() => setViewing(b)}
                onActivate={() => activate.mutate(b)}
                onDelete={() => setDeleting(b)}
                onDownload={() => downloadBundle(b)}
                activating={activate.isPending && activate.variables?.id === b.id}
              />
            ))}
            {brands.length > 0 && (
              <button
                onClick={onCreateNew}
                className="rounded-2xl border border-dashed border-border/80 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition flex flex-col items-center justify-center gap-2 p-6 min-h-[180px] text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">Create new brand</span>
              </button>
            )}
          </div>
        )}
      </Panel>

      {/* View brand */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-lg">
          {viewing && <BrandDetail brand={viewing} onDownload={() => downloadBundle(viewing)} />}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this brand?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} will be permanently removed from your library.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) remove.mutate(deleting.id);
                setDeleting(null);
              }}
            >
              Delete Brand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ActiveBrandCard({
  brand, onView, onCreateNew,
}: { brand: BrandRow; onView: () => void; onCreateNew: () => void }) {
  const theme = THEMES.find((t) => t.id === brand.theme);
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 rounded-xl bg-foreground/[0.03] border border-border/60 p-4">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <BrandLogo brand={brand} size="lg" theme={theme} />
        <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-display text-lg font-bold truncate">{brand.name}</h3>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" /> Active
          </span>
        </div>
        {brand.meaning_en && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{brand.meaning_en}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
          {theme && (
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: theme.accent }} />
              {theme.label}
            </span>
          )}
          <span>·</span>
          <span className="capitalize">{brand.brand_type}</span>
        </div>
      </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <Button size="sm" variant="outline" onClick={onView}>
          <Eye className="h-3.5 w-3.5 mr-1.5" /> View
        </Button>
        <Button size="sm" onClick={onCreateNew}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Build More Brand
        </Button>
      </div>
    </div>
  );
}

function BrandCard({
  brand, onView, onActivate, onDelete, onDownload, activating,
}: {
  brand: BrandRow;
  onView: () => void;
  onActivate: () => void;
  onDelete: () => void;
  onDownload: () => void;
  activating: boolean;
}) {
  const theme = THEMES.find((t) => t.id === brand.theme);
  return (
    <div className="rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <BrandLogo brand={brand} size="md" theme={theme} />
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-sm truncate">{brand.name}</div>
          {brand.meaning_en && (
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{brand.meaning_en}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
            {theme && <span className="h-2 w-2 rounded-full" style={{ background: theme.accent }} />}
            <span className="capitalize">{brand.brand_type}</span>
            <span>·</span>
            <span>{new Date(brand.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Button size="sm" variant="outline" onClick={onView}>
          <Eye className="h-3.5 w-3.5 mr-1" /> View
        </Button>
        <Button size="sm" variant="outline" onClick={onDownload}>
          <Download className="h-3.5 w-3.5 mr-1" /> Bundle
        </Button>
        <Button size="sm" onClick={onActivate} disabled={activating}>
          {activating ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Setting…</>
          ) : (
            <><Star className="h-3.5 w-3.5 mr-1" /> Set Active</>
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
        </Button>
      </div>
    </div>
  );
}

function BrandLogo({
  brand, size, theme,
}: { brand: BrandRow; size: "md" | "lg"; theme?: Theme }) {
  const dim = size === "lg" ? "h-16 w-16 text-xl" : "h-12 w-12 text-sm";
  const initials = brand.name
    .split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").slice(0, 2).join("");
  if (brand.logo_url) {
    return (
      <div className={`${dim} rounded-xl overflow-hidden border border-border/60 bg-white shrink-0`}>
        <img src={brand.logo_url} alt={brand.name} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center font-display font-bold text-white shrink-0`}
      style={{ background: `linear-gradient(135deg, ${theme?.primary ?? "#0f172a"}, ${theme?.accent ?? "#2563EB"})` }}
    >
      {initials}
    </div>
  );
}

function BrandDetail({ brand, onDownload }: { brand: BrandRow; onDownload: () => void }) {
  const theme = THEMES.find((t) => t.id === brand.theme);
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <BrandLogo brand={brand} size="md" theme={theme} />
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate">{brand.name}</DialogTitle>
            <DialogDescription className="capitalize">
              {brand.brand_type} · {theme?.label ?? brand.theme} · created {new Date(brand.created_at).toLocaleDateString()}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      <div className="space-y-3 text-sm">
        {brand.meaning_en && (
          <DetailRow label="Meaning (English)" value={brand.meaning_en} />
        )}
        {brand.meaning_ur && (
          <DetailRow label="معنی (Urdu)" value={brand.meaning_ur} rtl />
        )}
        {brand.logo_prompt && (
          <DetailRow label="Logo prompt" value={brand.logo_prompt} mono />
        )}
        {brand.facebook_handle && (
          <DetailRow label="Facebook" value={brand.facebook_handle} />
        )}
        {brand.instagram_handle && (
          <DetailRow label="Instagram" value={brand.instagram_handle} />
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDownload}>
          <Download className="h-4 w-4 mr-2" /> Download bundle
        </Button>
      </DialogFooter>
    </>
  );
}

function DetailRow({ label, value, rtl, mono }: { label: string; value: string; rtl?: boolean; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div
        className={`rounded-lg bg-foreground/[0.04] border border-border/60 px-3 py-2 ${mono ? "font-mono text-xs whitespace-pre-wrap max-h-40 overflow-y-auto" : ""}`}
        dir={rtl ? "rtl" : "ltr"}
      >
        {value}
      </div>
    </div>
  );
}

function downloadBundle(brand: BrandRow) {
  const theme = THEMES.find((t) => t.id === brand.theme);
  const lines = [
    `# ${brand.name}`,
    "",
    `**Brand type:** ${brand.brand_type}`,
    `**Theme:** ${theme?.label ?? brand.theme} (${theme?.accent ?? ""})`,
    `**Created:** ${new Date(brand.created_at).toLocaleDateString()}`,
    "",
    "## English Meaning",
    brand.meaning_en || "—",
    "",
    "## معنی (Urdu)",
    brand.meaning_ur || "—",
    "",
    "## Logo prompt",
    "```",
    brand.logo_prompt || "—",
    "```",
    "",
    "## Logo",
    brand.logo_url ? brand.logo_url : "Not uploaded yet.",
    "",
    "## Facebook",
    brand.facebook_handle || "—",
    "",
    "## Instagram",
    brand.instagram_handle || "—",
    "",
    "## Tagline",
    brand.tagline || "—",
    "",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const safeName = brand.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}-brand-bundle.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success("Brand bundle downloaded");
}

// =============================================================================
// Wizard
// =============================================================================
function BrandWizard({
  state, setState, onSaved,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  onSaved: () => void;
}) {
  const [language, setLanguageState] = useState<BrandLanguage>(() => detectLanguage());
  const set = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const setLanguage = (l: BrandLanguage) => {
    setLanguageState(l);
    try { localStorage.setItem(LANG_LS_KEY, l); } catch {/* ignore */}
  };

  const next = () => set("step", Math.min(state.step + 1, TOTAL_STEPS));
  const prev = () => set("step", Math.max(state.step - 1, 1));

  const pct = Math.round((state.step / TOTAL_STEPS) * 100);
  const theme = THEMES.find((t) => t.id === state.themeId) ?? null;

  return (
    <div>
      {/* Language selector */}
      <div className="rounded-2xl glass border border-border/60 p-3 mb-3 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mr-1">
          <Languages className="h-3.5 w-3.5" />
          <span className="font-medium">Meaning language</span>
        </div>
        <div className="flex gap-1.5">
          {SUPPORTED_BRAND_LANGUAGES.map((l) => {
            const active = language === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition ${active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 bg-foreground/[0.03] hover:border-primary/40"}`}
              >
                {l.native}
              </button>
            );
          })}
        </div>
        <span className="ml-auto text-[10px] text-muted-foreground">Brand names stay in English.</span>
      </div>

      {/* Progress */}
      <div className="rounded-2xl glass border border-border/60 p-4 mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Brand Builder
          </div>
          <div className="text-[11px] font-medium tabular">
            Step {state.step} of {TOTAL_STEPS}
            <span className="text-muted-foreground"> · {pct}%</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition ${i < state.step ? "" : "bg-foreground/[0.08]"}`}
              style={i < state.step ? { background: "var(--gradient-brand)" } : undefined}
            />
          ))}
        </div>
      </div>

      {state.step === 1 && <Step1Type state={state} set={set} onNext={next} />}
      {state.step === 2 && <Step2Names state={state} set={set} onNext={next} onBack={prev} language={language} />}
      {state.step === 3 && <Step3Meaning state={state} set={set} onNext={next} onBack={prev} />}
      {state.step === 4 && <StepLogoStyle state={state} set={set} onNext={next} onBack={prev} />}
      {state.step === 5 && <Step4Theme state={state} set={set} onNext={next} onBack={prev} />}
      {state.step === 6 && <Step5LogoPrompt state={state} set={set} theme={theme} onNext={next} onBack={prev} />}
      {state.step === 7 && <Step6Ideogram state={state} onNext={next} onBack={prev} />}
      {state.step === 8 && <Step7UploadLogo state={state} set={set} onNext={next} onBack={prev} />}
      {state.step === 9 && <Step8Facebook state={state} set={set} onNext={next} onBack={prev} />}
      {state.step === 10 && <Step9Instagram state={state} set={set} onNext={next} onBack={prev} />}
      {state.step === 11 && <Step10Save state={state} onBack={prev} onSaved={onSaved} />}
    </div>
  );
}

// --- Step 1 — Brand type
function Step1Type({
  state, set, onNext,
}: { state: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Panel title="Select brand type" description="Pick the brand category. This determines the default suffix and tone.">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BRAND_TYPES.map((t) => {
            const active = state.brandType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => set("brandType", t.id)}
                className={`relative px-3 py-3 rounded-xl border text-left transition ${active
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-foreground/[0.03] hover:border-primary/40"}`}
              >
                <div className="text-sm font-semibold">{t.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">…{t.suffix}</div>
                {active && (
                  <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Panel>
      <div className="flex justify-end">
        <Button onClick={onNext}>Continue <ArrowRight className="h-4 w-4 ml-2" /></Button>
      </div>
    </div>
  );
}

// --- Step 2 — Generate names
function Step2Names({
  state, set, onNext, onBack, language,
}: {
  state: WizardState;
  set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  onNext: () => void; onBack: () => void;
  language: BrandLanguage;
}) {
  const run = useServerFn(generateBrandNames);
  const translate = useServerFn(translateBrandMeanings);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [lastLang, setLastLang] = useState<BrandLanguage>(language);

  const typeDef = BRAND_TYPES.find((t) => t.id === state.brandType)!;

  const generate = async () => {
    setLoading(true);
    try {
      const seed = crypto.randomUUID().slice(0, 8);
      const res = await run({
        data: { niche: state.niche, serviceType: typeDef.label, seed, language },
      });
      set("names", res.items);
      set("baseName", "");
      set("selectedName", "");
      set("meaningEn", "");
      set("meaningUr", "");
      setLastLang(res.language);
      toast.success(`Generated ${res.items.length} fresh names`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (language === lastLang) return;
    if (state.names.length === 0) { setLastLang(language); return; }
    let cancelled = false;
    (async () => {
      setTranslating(true);
      try {
        const res = await translate({ data: { names: state.names.map((n) => n.name), language } });
        if (cancelled) return;
        const byName = new Map(res.items.map((it) => [it.name, it.meaning]));
        set("names", state.names.map((n) => ({ name: n.name, meaning: byName.get(n.name) ?? n.meaning })));
        setLastLang(language);
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Translation failed");
      } finally { if (!cancelled) setTranslating(false); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const isUrdu = language === "ur";

  return (
    <div className="space-y-4">
      <Panel title="Generate brand names" description="10 unique, premium, banking-friendly names. Regenerate as often as you like — every batch is fresh.">
        <div>
          <Label className="text-xs">Niche (optional)</Label>
          <Input
            className="mt-1.5 bg-foreground/[0.03]"
            value={state.niche}
            onChange={(e) => set("niche", e.target.value)}
            placeholder="e.g. UK company formation, fintech, agency"
          />
        </div>
        <Button onClick={generate} disabled={loading} size="lg" className="w-full mt-4">
          {loading
            ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating fresh names…</>)
            : (<><Sparkles className="h-4 w-4 mr-2" /> Generate 10 names</>)}
        </Button>
      </Panel>

      {state.names.length > 0 && (
        <Panel title="Pick your brand" description="Tap a name to select.">
          {translating && (
            <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Translating meanings…
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-2">
            {state.names.map((item) => {
              const base = ensureCategoryWord(item.name, typeDef.label);
              const active = state.baseName === base;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    set("baseName", base);
                    const end = state.ending || "Ltd";
                    if (!state.ending) set("ending", "Ltd");
                    set("selectedName", `${base} ${end}`);
                    set("meaningEn", language === "en" ? item.meaning : state.meaningEn);
                    set("meaningUr", language === "ur" ? item.meaning : state.meaningUr);
                  }}
                  className={`relative text-left px-4 py-3 rounded-xl border transition ${active
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-foreground/[0.03] hover:border-primary/40"}`}
                >
                  <div className="font-display font-semibold text-sm truncate pr-7">{base}</div>
                  {item.meaning && (
                    <div
                      className="mt-1.5 text-[11px] text-muted-foreground leading-snug"
                      dir={isUrdu ? "rtl" : "ltr"}
                      lang={language}
                    >
                      {item.meaning}
                    </div>
                  )}
                  {active && (
                    <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={generate} disabled={loading} className="sm:flex-1">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Generate more
            </Button>
          </div>
        </Panel>
      )}

      {state.baseName && (
        <Panel title="Company ending" description="Choose how your legal name ends. This is saved as part of the brand.">
          <div className="grid grid-cols-2 gap-2">
            {(["Ltd", "Limited"] as const).map((opt) => {
              const active = state.ending === opt;
              return (
                <button
                  key={opt}
                  onClick={() => {
                    set("ending", opt);
                    set("selectedName", `${state.baseName} ${opt}`);
                  }}
                  className={`relative px-4 py-3 rounded-xl border text-sm font-semibold transition ${active
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-foreground/[0.03] hover:border-primary/40"}`}
                >
                  {opt}
                  {active && (
                    <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl border border-border/60 bg-foreground/[0.03] px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Final brand name</div>
            <div className="mt-1 font-display font-semibold text-base">
              {state.ending ? `${state.baseName} ${state.ending}` : `${state.baseName} —`}
            </div>
          </div>
        </Panel>
      )}

      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!state.baseName || !state.ending || !state.selectedName} />
    </div>
  );
}

// --- Step 3 — Meaning (English + Urdu)
function Step3Meaning({
  state, set, onNext, onBack,
}: {
  state: WizardState;
  set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  onNext: () => void; onBack: () => void;
}) {
  const translate = useServerFn(translateBrandMeanings);
  const [busy, setBusy] = useState(false);

  const ensureBoth = async () => {
    if (state.meaningEn && state.meaningUr) return;
    setBusy(true);
    try {
      const need: { lang: BrandLanguage; key: "meaningEn" | "meaningUr" }[] = [];
      if (!state.meaningEn) need.push({ lang: "en", key: "meaningEn" });
      if (!state.meaningUr) need.push({ lang: "ur", key: "meaningUr" });
      const results = await Promise.all(
        need.map((n) => translate({ data: { names: [state.selectedName], language: n.lang } })),
      );
      results.forEach((r, i) => {
        const meaning = r.items[0]?.meaning ?? "";
        if (meaning) set(need[i].key, meaning);
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Translation failed");
    } finally { setBusy(false); }
  };

  useEffect(() => { if (state.selectedName) void ensureBoth(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="space-y-4">
      <Panel
        title={`Meaning for ${state.selectedName}`}
        description="Brand impressions in English and Urdu. You can edit either before saving."
      >
        <div className="space-y-3">
          <div>
            <Label className="text-xs flex items-center justify-between">
              <span>English meaning</span>
              {busy && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </Label>
            <textarea
              className="mt-1.5 w-full rounded-lg bg-foreground/[0.03] border border-border/60 px-3 py-2 text-sm min-h-[64px]"
              value={state.meaningEn}
              onChange={(e) => set("meaningEn", e.target.value)}
              placeholder="A premium and trustworthy identity for…"
            />
          </div>
          <div>
            <Label className="text-xs">معنی (Urdu)</Label>
            <textarea
              dir="rtl"
              lang="ur"
              className="mt-1.5 w-full rounded-lg bg-foreground/[0.03] border border-border/60 px-3 py-2 text-sm min-h-[64px]"
              value={state.meaningUr}
              onChange={(e) => set("meaningUr", e.target.value)}
              placeholder="ایک جدید اور قابل اعتماد شناخت…"
            />
          </div>
          <Button variant="outline" size="sm" onClick={ensureBoth} disabled={busy}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${busy ? "animate-spin" : ""}`} /> Regenerate both
          </Button>
        </div>
      </Panel>
      <NavRow onBack={onBack} onNext={onNext} />
    </div>
  );
}


// --- Step (new) — Logo Style
function StepLogoStyle({
  state, set, onNext, onBack,
}: { state: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; onNext: () => void; onBack: () => void }) {
  const brand = state.selectedName || "Your Brand Ltd";
  return (
    <div className="space-y-4">
      <Panel
        title="Choose a logo style"
        description="Pick the professional logo direction. Your selection is injected into the Ideogram prompt."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LOGO_STYLES.map((s) => {
            const active = state.logoStyleId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => set("logoStyleId", s.id)}
                className={`relative text-left p-4 rounded-2xl border transition ${active
                  ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                  : "border-border/60 bg-foreground/[0.02] hover:border-primary/40"}`}
              >
                <LogoStylePreview kind={s.preview} brand={brand} />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="font-display font-semibold text-sm">{s.label}</div>
                  {active && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{s.description}</div>
                <div className="text-[10px] text-muted-foreground/80 mt-1.5 italic">Inspired by: {s.inspiration}</div>
              </button>
            );
          })}
        </div>
      </Panel>
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!state.logoStyleId} />
    </div>
  );
}

function LogoStylePreview({ kind, brand }: { kind: LogoStyle["preview"]; brand: string }) {
  const initials = brand.split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").filter(Boolean).slice(0, 2).join("");
  const base = "h-20 rounded-xl border border-border/60 bg-gradient-to-br from-background to-foreground/[0.04] flex items-center justify-center px-3 overflow-hidden";
  if (kind === "wordmark") {
    return <div className={base}><div className="font-display font-bold tracking-tight text-sm truncate">{brand}</div></div>;
  }
  if (kind === "icon-word") {
    return (
      <div className={base}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-md bg-primary shrink-0" />
          <div className="font-display font-semibold text-sm truncate">{brand}</div>
        </div>
      </div>
    );
  }
  if (kind === "lettermark") {
    return (
      <div className={base}>
        <div className="flex flex-col items-center">
          <div className="font-display font-extrabold text-2xl leading-none tracking-tight">{initials || "BR"}</div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1 truncate max-w-[140px]">{brand}</div>
        </div>
      </div>
    );
  }
  if (kind === "minimal") {
    return (
      <div className={base}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-2 w-2 rounded-full bg-foreground" />
          <div className="font-light text-sm tracking-tight truncate">{brand}</div>
        </div>
      </div>
    );
  }
  if (kind === "shield") {
    return (
      <div className={base}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-5 bg-foreground/80" style={{ clipPath: "polygon(50% 0,100% 25%,100% 70%,50% 100%,0 70%,0 25%)" }} />
          <div className="font-display font-semibold text-sm truncate">{brand}</div>
        </div>
      </div>
    );
  }
  // ai
  return (
    <div className={base}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <div className="text-xs">AI picks the best style</div>
      </div>
    </div>
  );
}

// --- Step 4 — Theme
function Step4Theme({
  state, set, onNext, onBack,
}: { state: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <Panel
        title="Choose your color theme"
        description={`Pick a professional palette for ${state.selectedName || "your brand"}.`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {THEMES.map((t) => {
            const active = state.themeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => set("themeId", t.id)}
                className={`relative p-3 rounded-xl border text-left transition ${active
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border/60 hover:border-primary/40"}`}
              >
                <div className="h-16 rounded-lg overflow-hidden flex">
                  <div className="flex-1" style={{ background: t.primary }} />
                  <div className="flex-1" style={{ background: t.secondary }} />
                  <div className="flex-1" style={{ background: t.accent }} />
                </div>
                <div className="mt-2 text-[11px] font-medium truncate">{t.label}</div>
                {active && (
                  <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Panel>
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!state.themeId} />
    </div>
  );
}

// --- Step 5 — Logo prompt
function buildLogoPrompt(name: string, theme: Theme | null, style: LogoStyle | null, brandType?: string): string {
  const accent = theme?.accent ?? "#2563EB";
  const themeLabel = theme?.label ?? "Blue";
  const styleLine = style?.promptStyleLine ?? "Corporate Wordmark — premium fintech-grade text logo.";
  const styleChars = style?.promptCharacteristics ?? "Clean confident sans-serif wordmark, no mascot.";
  const inspiration = style?.inspiration ?? "PayPal, Wise, Stripe, Revolut";
  return `Create a premium corporate ${brandType ? brandType + " " : ""}logo for "${name}" using a ${themeLabel.toLowerCase()}, white and black color palette.

Style:
${styleLine}

Inspired by:
${inspiration}.

Characteristics:
${styleChars}

Main color: deep matte black. Secondary: white. Accent highlight: ${accent} (use sparingly).
Background: clean studio backdrop, centered composition, generous negative space.
Scalable, transparent-ready, premium corporate / fintech grade, trustworthy, international.

Strictly NO: mascots, animals, people, faces, cartoons, gaming aesthetic, retro/grunge, neon glow, chrome, metallic gold/silver finishes, 3D effects (unless explicitly part of the chosen style).`;
}

function Step5LogoPrompt({
  state, set, theme, onNext, onBack,
}: {
  state: WizardState;
  set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  theme: Theme | null; onNext: () => void; onBack: () => void;
}) {
  const logoStyle = LOGO_STYLES.find((s) => s.id === state.logoStyleId) ?? null;
  const prompt = useMemo(
    () => buildLogoPrompt(state.selectedName, theme, logoStyle, state.brandType),
    [state.selectedName, theme, logoStyle, state.brandType],
  );

  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt); toast.success("Logo prompt copied"); }
    catch { toast.error("Copy failed"); }
  };

  return (
    <div className="space-y-4">
      <Panel
        title={`Logo prompt for ${state.selectedName}`}
        description="A premium 3D wordmark prompt tuned to your theme. Copy it, then generate on Ideogram."
      >
        <div className="rounded-xl bg-foreground/[0.04] border border-border/60 p-3 text-xs whitespace-pre-wrap leading-relaxed max-h-[40vh] overflow-y-auto">
          {prompt}
        </div>
        <Button onClick={copy} className="w-full mt-3" size="lg">
          <Copy className="h-4 w-4 mr-2" /> Copy logo prompt
        </Button>
      </Panel>
      <NavRow onBack={onBack} onNext={onNext} />
    </div>
  );
}

// --- Step 6 — Ideogram
function Step6Ideogram({ state, onNext, onBack }: { state: WizardState; onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <Panel
        title={`Generate the ${state.selectedName} logo on Ideogram`}
        description="Open Ideogram, paste the prompt, generate, and download a transparent PNG."
      >
        <ol className="space-y-2 text-sm">
          {[
            "Open Ideogram and sign in.",
            "Paste the prompt you just copied.",
            "Generate 4 variations. Pick the cleanest mark.",
            "Download as transparent PNG.",
            "Come back here and upload on the next step.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="h-6 w-6 shrink-0 rounded-full bg-foreground/[0.06] text-xs font-semibold flex items-center justify-center">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <a href="https://ideogram.ai" target="_blank" rel="noreferrer" className="block mt-4">
          <Button className="w-full" size="lg" variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" /> Open Ideogram
          </Button>
        </a>
      </Panel>
      <NavRow onBack={onBack} onNext={onNext} nextLabel={`I have the ${state.selectedName} logo`} />
    </div>
  );
}

// --- Step 7 — Upload logo
function Step7UploadLogo({
  state, set, onNext, onBack,
}: { state: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; onNext: () => void; onBack: () => void }) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadPartnerLogo(user.id, file);
      set("logoUrl", url);
      toast.success("Logo uploaded");
    } catch (e) {
      console.error(e);
      toast.error("Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <div className="space-y-4">
      <Panel title={`Upload the ${state.selectedName} logo`} description="PNG with transparent background works best.">
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-xl border border-border/60 bg-foreground/[0.04] flex items-center justify-center overflow-hidden shrink-0">
            {state.logoUrl ? (
              <img src={state.logoUrl} alt={state.selectedName} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full">
              {uploading
                ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</>)
                : (<><Upload className="h-4 w-4 mr-2" /> {state.logoUrl ? "Replace logo" : `Upload ${state.selectedName} logo`}</>)}
            </Button>
            <p className="text-[10px] text-muted-foreground mt-1">You can skip this and add the logo later.</p>
          </div>
        </div>
      </Panel>
      <NavRow onBack={onBack} onNext={onNext} />
    </div>
  );
}

// --- Step 8 — Facebook
function Step8Facebook({
  state, set, onNext, onBack,
}: { state: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; onNext: () => void; onBack: () => void }) {
  const brand = state.selectedName;
  const handle = brand.toLowerCase().replace(/\s+(ltd|limited|formations|solutions|services|consulting)\.?$/i, "").replace(/\s+/g, "");
  return (
    <div className="space-y-4">
      <Panel
        title={`Create the Facebook Page for ${brand}`}
        description={`Create a Facebook Business Page using the exact name: ${brand}.`}
      >
        <Checklist items={[
          "Open Facebook",
          "Create new Page",
          `Page Name: ${brand}`,
          "Category: Business Service",
          `Upload the ${brand} logo as profile picture`,
          `Suggested username: @${handle}`,
          "Publish page",
          "Copy the page URL and paste it below",
        ]} />
        <a href="https://facebook.com/pages/create" target="_blank" rel="noreferrer" className="block mt-3">
          <Button variant="outline" className="w-full"><Facebook className="h-4 w-4 mr-2" /> Open Facebook Page Creator</Button>
        </a>
        <div className="mt-4">
          <Label className="text-xs">{brand} Facebook URL (optional)</Label>
          <Input
            value={state.facebookUrl}
            onChange={(e) => set("facebookUrl", e.target.value)}
            placeholder={`https://facebook.com/${handle}`}
            className="bg-foreground/[0.03] mt-1.5"
          />
        </div>
      </Panel>
      <NavRow onBack={onBack} onNext={onNext} />
    </div>
  );
}

// --- Step 9 — Instagram
function Step9Instagram({
  state, set, onNext, onBack,
}: { state: WizardState; set: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; onNext: () => void; onBack: () => void }) {
  const brand = state.selectedName;
  const compact = brand.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const root = brand.toLowerCase().replace(/\s+(ltd|limited|formations|solutions|services|consulting)\.?$/i, "").replace(/[^a-z0-9]+/g, "");
  const handles = Array.from(new Set([`@${compact}`, `@${root}`])).filter((h) => h.length > 1);
  return (
    <div className="space-y-4">
      <Panel
        title={`Create the Instagram account for ${brand}`}
        description={`Use the exact brand name and connect to your Facebook Page.`}
      >
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Suggested usernames</div>
          <div className="flex flex-wrap gap-1.5">
            {handles.map((h) => (
              <span key={h} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-foreground/[0.05] border border-border/60">{h}</span>
            ))}
          </div>
        </div>
        <Checklist items={[
          `Create Instagram account for ${brand}`,
          `Use ${handles[0]}`,
          "Switch to Business Profile",
          `Set the ${brand} logo as profile picture`,
          "Connect to your Facebook Page",
          "Copy the profile URL and paste it below",
        ]} />
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="block mt-3">
          <Button variant="outline" className="w-full"><Instagram className="h-4 w-4 mr-2" /> Open Instagram</Button>
        </a>
        <div className="mt-4">
          <Label className="text-xs">{brand} Instagram URL (optional)</Label>
          <Input
            value={state.instagramUrl}
            onChange={(e) => set("instagramUrl", e.target.value)}
            placeholder={`https://instagram.com/${compact}`}
            className="bg-foreground/[0.03] mt-1.5"
          />
        </div>
      </Panel>
      <NavRow onBack={onBack} onNext={onNext} nextLabel="Review & save" />
    </div>
  );
}

// --- Step 10 — Save
function Step10Save({
  state, onBack, onSaved,
}: { state: WizardState; onBack: () => void; onSaved: () => void }) {
  const qc = useQueryClient();
  const createFn = useServerFn(createBrand);
  const [setActive, setSetActive] = useState(true);
  const theme = THEMES.find((t) => t.id === state.themeId);

  const save = useMutation({
    mutationFn: () => createFn({
      data: {
        name: state.selectedName,
        brand_type: state.brandType,
        meaning_en: state.meaningEn,
        meaning_ur: state.meaningUr,
        theme: state.themeId,
        logo_prompt: buildLogoPrompt(state.selectedName, theme ?? null, LOGO_STYLES.find((s) => s.id === state.logoStyleId) ?? null, state.brandType),
        logo_url: state.logoUrl || undefined,
        facebook_handle: state.facebookUrl || undefined,
        instagram_handle: state.instagramUrl || undefined,
        set_active: setActive,
        theme_primary: theme?.primary,
        theme_secondary: theme?.accent,
      },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success(`${state.selectedName} saved to your Brand Library`);
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div className="space-y-4">
      <Panel title="Review & save" description="Confirm details and save the brand to your library.">
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Summary label="Brand" value={state.selectedName} />
          <Summary label="Type" value={state.brandType} />
          <Summary label="Theme" value={theme?.label ?? "—"} />
          <Summary label="Logo" value={state.logoUrl ? "Uploaded" : "—"} />
          <Summary label="Facebook" value={state.facebookUrl || "—"} />
          <Summary label="Instagram" value={state.instagramUrl || "—"} />
        </div>
        {state.meaningEn && (
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">English meaning</div>
            <div className="rounded-lg bg-foreground/[0.04] border border-border/60 px-3 py-2 text-xs">{state.meaningEn}</div>
          </div>
        )}
        {state.meaningUr && (
          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">معنی (Urdu)</div>
            <div dir="rtl" className="rounded-lg bg-foreground/[0.04] border border-border/60 px-3 py-2 text-xs">{state.meaningUr}</div>
          </div>
        )}
        <label className="mt-4 flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={setActive}
            onChange={(e) => setSetActive(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span>Set as <strong>Active Brand</strong> immediately (mirror into Partner Profile)</span>
        </label>
      </Panel>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={save.isPending}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending || !state.selectedName} className="flex-1">
          {save.isPending
            ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>)
            : (<><CheckCircle2 className="h-4 w-4 mr-2" /> Save to library</>)}
        </Button>
      </div>
    </div>
  );
}

// --- Reusable bits
function NavRow({ onBack, onNext, nextDisabled, nextLabel }: {
  onBack: () => void; onNext: () => void; nextDisabled?: boolean; nextLabel?: string;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onBack} className="flex-1">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      <Button onClick={onNext} disabled={nextDisabled} className="flex-1">
        {nextLabel ?? "Continue"} <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-foreground/[0.03] border border-border/60 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-sm font-medium truncate">{value || "—"}</div>
    </div>
  );
}

// silence unused-vars on icons that may be referenced via future steps
void Palette; void Wand2; void Link; void UserCircle;
