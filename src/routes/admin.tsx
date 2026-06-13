import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { parseMasterMessage } from "@/lib/parse-creative.functions";
import { useMemo, useRef, useState } from "react";
import {
  
  Users,
  Activity,
  AlertTriangle,
  ImagePlus,
  Search,
  Filter,
  Eye,
  Archive,
  ArchiveRestore,
  Trash2,
  Upload,
  Save,
  Check,
  Building2,
  Globe,
  Mail,
  Phone,
  MessageCircle,
  UserCircle,
  Image as ImageIc,
  Layers,
  Palette,
  Plus,
  X,
  Pencil,
  Tag as TagIcon,
  Briefcase,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Panel, StatCard } from "@/components/ui-bits";
import { uploadAdminCreative, uploadPartnerLogo } from "@/lib/storage";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CREATIVE_CATEGORIES, gradientFor, type CreativeCategory } from "@/lib/creative-categories";
import { useAdminCreatives } from "@/lib/data";
import type { AdminCreative } from "@/lib/data/types";
import {
  useAdminSettings,
  DEFAULT_ADMIN_SETTINGS,
  type AdminSettings,
} from "@/lib/admin-settings";
import {
  AdminCommissionsTab,
  AdminPartnersTab,
  AdminOrdersTab,
  AdminAuditTab,
} from "@/components/admin-management";
import { AiUsageTab } from "@/components/admin/ai-usage-tab";
import { useAllPartners, useAllCommissions, useAllOrders } from "@/lib/data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Center — DigiFormation" }] }),
  component: AdminCenter,
});

function AdminCenter() {
  return (
    <AppLayout title="Admin Center" subtitle="Program-level oversight and source-of-truth for partners">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-foreground/[0.04] border border-border/60 mb-5 overflow-x-auto w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="commissions">Revenue</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="creatives">Creatives</TabsTrigger>
          <TabsTrigger value="ai-usage">AI Usage</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="orders"><AdminOrdersTab /></TabsContent>
        <TabsContent value="commissions"><AdminCommissionsTab /></TabsContent>
        <TabsContent value="partners"><AdminPartnersTab /></TabsContent>
        <TabsContent value="audit"><AdminAuditTab /></TabsContent>
        <TabsContent value="creatives"><CreativesTab /></TabsContent>
        <TabsContent value="ai-usage"><AiUsageTab /></TabsContent>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="branding"><BrandingTab /></TabsContent>
      </Tabs>
    </AppLayout>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: items } = useAdminCreatives({ includeArchived: true });
  const active = items.filter((c) => !c.is_archived).length;
  const archived = items.filter((c) => c.is_archived).length;
  const { data: partners } = useAllPartners();
  const { data: commissions } = useAllCommissions();
  const { data: orders } = useAllOrders();

  const pendingCommissions = commissions.filter((c) => c.status === "pending").length;
  const delayedCommissions = commissions.filter((c) => c.status === "delayed").length;
  const paidCommissions = commissions.filter((c) => c.status === "paid").length;
  const inProgressOrders = orders.filter((o) => o.status === "in_progress" || o.status === "waiting_documents").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Partners" value={String(partners.length)} icon={<Users className="h-5 w-5" />} variant="primary" />
        <StatCard label="Total orders" value={String(orders.length)} icon={<Activity className="h-5 w-5" />} variant="primary" />
        <StatCard label="Completed orders" value={String(completedOrders)} icon={<Check className="h-5 w-5" />} variant="success" />
        <StatCard label="Live creatives" value={String(active)} icon={<ImageIc className="h-5 w-5" />} variant="ai" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
        <StatCard label="Orders in progress" value={String(inProgressOrders)} icon={<Activity className="h-5 w-5" />} variant="warning" />
        <StatCard label="Paid payouts" value={String(paidCommissions)} icon={<Check className="h-5 w-5" />} variant="success" />
        <StatCard label="Pending payouts" value={String(pendingCommissions)} icon={<AlertTriangle className="h-5 w-5" />} variant="warning" />
        <StatCard label="Delayed payouts" value={String(delayedCommissions)} icon={<AlertTriangle className="h-5 w-5" />} variant="warning" />
      </div>

      <Panel title="At a glance" className="mt-6">
        <p className="text-xs text-muted-foreground">
          {orders.length} orders · {commissions.length} revenue records · {paidCommissions} paid · {archived} archived creatives.
          Use the Orders, Revenue, Partners, and Audit Log tabs to manage the program.
        </p>
      </Panel>
    </>
  );
}

// ─── Creative Library ────────────────────────────────────────────────────────

const FILTER_CATEGORIES = ["All", ...CREATIVE_CATEGORIES] as const;
type Filter = (typeof FILTER_CATEGORIES)[number];

function CreativesTab() {
  const { data: items, insert, update, archive, remove } = useAdminCreatives({ includeArchived: true });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCreative | null>(null);
  const [previewOf, setPreviewOf] = useState<AdminCreative | null>(null);

  const filtered = useMemo(() => {
    return items
      .filter((c) => (showArchived ? true : !c.is_archived))
      .filter((c) => (filter === "All" ? true : c.category === filter))
      .filter((c) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          c.title + " " + c.description + " " + c.category + " " + c.service_name + " " + (c.tags || []).join(" ")
        )
          .toLowerCase()
          .includes(q);
      });
  }, [items, filter, query, showArchived]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c: AdminCreative) => { setEditing(c); setFormOpen(true); };

  const replaceImage = async (c: AdminCreative, file: File) => {
    try {
      const url = await uploadAdminCreative(file);
      update(c.id, { image_url: url });
    } catch (e) {
      console.error("replace image failed", e);
    }
  };

  return (
    <>
      <Panel className="!p-4 sm:!p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, category, service, tags…"
              className="pl-9 bg-foreground/[0.03] border-border/60"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchived((s) => !s)}
              className={cn(
                "text-xs px-3 py-2 rounded-lg border transition",
                showArchived
                  ? "border-warning/50 bg-warning/10 text-warning"
                  : "border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              <Archive className="inline h-3.5 w-3.5 mr-1.5" />
              {showArchived ? "Hide archived" : "Show archived"}
            </button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1.5" /> Upload Creative
            </Button>
          </div>
        </div>

        <div className="mt-4 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <Filter className="h-4 w-4 mt-2 text-muted-foreground shrink-0" />
          {FILTER_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "whitespace-nowrap text-xs px-2.5 py-1.5 rounded-full border transition",
                filter === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <Panel className="mt-5 text-center py-12">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-foreground/[0.06] flex items-center justify-center mb-3">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-display text-base font-semibold">No creatives match</h3>
          <p className="text-sm text-muted-foreground mt-1">Try a different filter, or upload a new reference creative.</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" /> Upload Creative
          </Button>
        </Panel>
      ) : (
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((c) => (
            <CreativeCard
              key={c.id}
              creative={c}
              onPreview={() => setPreviewOf(c)}
              onEdit={() => openEdit(c)}
              onArchive={() => archive(c.id, !c.is_archived)}
              onDelete={() => remove(c.id)}
              onReplaceImage={(file) => replaceImage(c, file)}
            />
          ))}
        </div>
      )}

      <CreativeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={(input) => {
          if (editing) {
            update(editing.id, input);
          } else {
            insert({ ...input, is_archived: false, uploaded_by: null });
          }
          setFormOpen(false);
          setEditing(null);
        }}
      />
      <PreviewDialog creative={previewOf} onOpenChange={(o) => !o && setPreviewOf(null)} />
    </>
  );
}

function CreativeCard({
  creative,
  onPreview,
  onEdit,
  onArchive,
  onDelete,
  onReplaceImage,
}: {
  creative: AdminCreative;
  onPreview: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onReplaceImage: (file: File) => void;
}) {
  const replaceRef = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-2xl glass overflow-hidden group flex flex-col">
      <div
        className="aspect-[4/3] relative bg-cover bg-center"
        style={
          creative.image_url
            ? { backgroundImage: `url(${creative.image_url})` }
            : { background: gradientFor(creative.id) }
        }
      >
        {!creative.image_url && (
          <div className="absolute inset-0 flex items-end p-3">
            <div className="text-white text-xs font-display font-semibold leading-tight drop-shadow line-clamp-2">
              {creative.title}
            </div>
          </div>
        )}
        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-background/70 backdrop-blur">
          {creative.category}
        </span>
        {creative.is_archived && (
          <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-warning/85 text-warning-foreground">
            Archived
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-sm font-medium leading-snug line-clamp-2">{creative.title}</div>
        {creative.service_name && (
          <div className="text-[11px] text-primary mt-0.5 flex items-center gap-1">
            <Briefcase className="h-3 w-3" /> {creative.service_name}
          </div>
        )}
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{creative.description}</p>
        {creative.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {creative.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/[0.06] text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 text-xs flex-1" onClick={onPreview}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => replaceRef.current?.click()}
            title="Replace image (keeps ID, stats and references)"
          >
            <Upload className="h-3.5 w-3.5" />
          </Button>
          <input
            ref={replaceRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onReplaceImage(f);
              e.target.value = "";
            }}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onArchive} title={creative.is_archived ? "Restore" : "Archive"}>
            {creative.is_archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

type CreativeFormValues = {
  title: string;
  description: string;
  category: CreativeCategory;
  service_name: string;
  tags: string[];
  tagline: string;
  image_url: string | null;
  master_message: string;
};

const MASTER_MESSAGE_PLACEHOLDER = `𝑩𝒖𝒔𝒊𝒏𝒆𝒔𝒔 𝑭𝒐𝒓𝒎𝒂𝒕𝒊𝒐𝒏 & 𝑷𝒂𝒚𝒎𝒆𝒏𝒕 𝑺𝒐𝒍𝒖𝒕𝒊𝒐𝒏𝒔 🌍💼

Open your UK LTD company with DigiFormation.
Fast registration, compliance support, banking and payment gateway guidance.

WhatsApp: +92 316 446 7464
Email: info@digiformation.uk
Website: www.digiformation.uk

#UKCompanyFormation #BusinessSetup #StripeSetup #DigiFormation`;

function CreativeFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: AdminCreative | null;
  onSubmit: (input: CreativeFormValues) => void;
}) {
  const [masterMessage, setMasterMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const parseFn = useServerFn(parseMasterMessage);

  useMemo(() => {
    if (open) {
      setMasterMessage(initial?.master_message ?? "");
      setImageUrl(initial?.image_url ?? null);
      setError(null);
    }
  }, [open, initial]);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const url = await uploadAdminCreative(file);
      setImageUrl(url);
    } catch (e) {
      console.error("admin creative upload failed", e);
      setError("Image upload failed");
    }
  };

  const canSave = masterMessage.trim().length >= 10 && !parsing;

  const submit = async () => {
    if (!canSave) return;
    setParsing(true);
    setError(null);
    try {
      const parsed = await parseFn({ data: { masterMessage: masterMessage.trim() } });
      onSubmit({
        title: parsed.title,
        description: parsed.caption,
        tagline: parsed.cta,
        service_name: parsed.service_name,
        tags: parsed.hashtags.map((h: string) => h.replace(/^#/, "")),
        category: parsed.category as CreativeCategory,
        image_url: imageUrl,
        master_message: masterMessage.trim(),
      });
    } catch (e) {
      console.error("parse failed", e);
      setError(e instanceof Error ? e.message : "AI parse failed");
    } finally {
      setParsing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border-border/60 max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {initial ? "Edit creative" : "Upload reference creative"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Upload the image and paste the full marketing message — AI will extract title, service, category, caption, CTA and hashtags automatically.
          </p>
        </DialogHeader>

        <div className="grid sm:grid-cols-[1fr_1.4fr] gap-4 mt-2">
          <div>
            <Label className="text-xs">Creative image</Label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-1.5 w-full aspect-square rounded-xl border-2 border-dashed border-border/60 hover:border-primary/60 transition flex flex-col items-center justify-center bg-foreground/[0.03] overflow-hidden"
              style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" } : undefined}
            >
              {!imageUrl && (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="mt-2 text-xs text-muted-foreground">Click to upload</span>
                  <span className="text-[10px] text-muted-foreground/70">PNG, JPG up to 10MB</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            {imageUrl && (
              <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setImageUrl(null)}>
                <X className="h-3.5 w-3.5 mr-1" /> Remove
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Master creative message</Label>
            <Textarea
              value={masterMessage}
              onChange={(e) => setMasterMessage(e.target.value)}
              rows={16}
              placeholder={MASTER_MESSAGE_PLACEHOLDER}
              className="bg-foreground/[0.03] font-mono text-[12.5px] leading-relaxed min-h-[360px]"
            />
            <p className="text-[11px] text-muted-foreground">
              Paste the complete styled headline, body copy, contact details and hashtags. AI extracts the rest.
            </p>
            {error && (
              <p className="text-[11px] text-destructive">{error}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canSave}>
            {parsing ? (
              <>Parsing…</>
            ) : initial ? (
              <><Save className="h-4 w-4 mr-1.5" /> Save changes</>
            ) : (
              <><ImagePlus className="h-4 w-4 mr-1.5" /> Add to library</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewDialog({ creative, onOpenChange }: { creative: AdminCreative | null; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={!!creative} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border/60">
        <DialogHeader>
          <DialogTitle className="font-display">{creative?.title}</DialogTitle>
        </DialogHeader>
        {creative && (
          <>
            <div
              className="aspect-[4/3] rounded-xl bg-cover bg-center border border-border/60"
              style={creative.image_url ? { backgroundImage: `url(${creative.image_url})` } : { background: gradientFor(creative.id) }}
            />
            <div className="mt-3 text-xs flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-foreground/[0.06] text-foreground/80">{creative.category}</span>
              {creative.service_name && (
                <span className="px-2 py-0.5 rounded bg-primary/15 text-primary inline-flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> {creative.service_name}
                </span>
              )}
              <span className="text-muted-foreground">Added {new Date(creative.created_at).toLocaleDateString()}</span>
            </div>
            {creative.tagline && <p className="text-sm mt-2 italic text-foreground/80">“{creative.tagline}”</p>}
            {creative.description && <p className="text-sm text-muted-foreground mt-2">{creative.description}</p>}
            {creative.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {creative.tags.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/[0.06] text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────

function ProfileTab() {
  const { settings, save } = useAdminSettings();
  const [draft, setDraft] = useState<AdminSettings>(settings);
  const [saved, setSaved] = useState(false);

  // sync when settings load from Supabase
  useMemo(() => setDraft(settings), [settings]);

  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = () => {
    save({
      company_name: draft.company_name,
      founder: draft.founder,
      website: draft.website,
      email: draft.email,
      phone: draft.phone,
      whatsapp: draft.whatsapp,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleReset = () => {
    save({
      company_name: DEFAULT_ADMIN_SETTINGS.company_name,
      founder: DEFAULT_ADMIN_SETTINGS.founder,
      website: DEFAULT_ADMIN_SETTINGS.website,
      email: DEFAULT_ADMIN_SETTINGS.email,
      phone: DEFAULT_ADMIN_SETTINGS.phone,
      whatsapp: DEFAULT_ADMIN_SETTINGS.whatsapp,
    });
  };

  return (
    <Panel title="Admin Profile" description="Shared across every partner account — stored centrally">
      <div className="flex items-center gap-4 pb-5 mb-5 border-b border-border/60">
        <div className="h-16 w-16 rounded-2xl flex items-center justify-center font-display font-bold text-xl text-primary-foreground" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
          DF
        </div>
        <div>
          <div className="font-display text-lg font-semibold">{draft.company_name}</div>
          <div className="text-xs text-muted-foreground">Founded by {draft.founder}</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ProfileField icon={<Building2 className="h-3.5 w-3.5" />} label="Company Name">
          <Input value={draft.company_name} onChange={(e) => set("company_name", e.target.value)} className="bg-foreground/[0.03] pl-8" />
        </ProfileField>
        <ProfileField icon={<UserCircle className="h-3.5 w-3.5" />} label="Founder">
          <Input value={draft.founder} onChange={(e) => set("founder", e.target.value)} className="bg-foreground/[0.03] pl-8" />
        </ProfileField>
        <ProfileField icon={<Globe className="h-3.5 w-3.5" />} label="Website">
          <Input value={draft.website} onChange={(e) => set("website", e.target.value)} className="bg-foreground/[0.03] pl-8" />
        </ProfileField>
        <ProfileField icon={<Mail className="h-3.5 w-3.5" />} label="Email">
          <Input type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} className="bg-foreground/[0.03] pl-8" />
        </ProfileField>
        <ProfileField icon={<Phone className="h-3.5 w-3.5" />} label="Phone">
          <Input value={draft.phone} onChange={(e) => set("phone", e.target.value)} className="bg-foreground/[0.03] pl-8" />
        </ProfileField>
        <ProfileField icon={<MessageCircle className="h-3.5 w-3.5" />} label="WhatsApp">
          <Input value={draft.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="bg-foreground/[0.03] pl-8" />
        </ProfileField>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>Reset to default</Button>
        <Button onClick={handleSave}>
          {saved ? <><Check className="h-4 w-4 mr-1.5" /> Saved</> : <><Save className="h-4 w-4 mr-1.5" /> Save changes</>}
        </Button>
      </div>
    </Panel>
  );
}

function ProfileField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="relative mt-1.5">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        {children}
      </div>
    </div>
  );
}

// ─── Branding ────────────────────────────────────────────────────────────────

function BrandingTab() {
  const { settings, save } = useAdminSettings();
  const [draft, setDraft] = useState<AdminSettings>(settings);
  const [saved, setSaved] = useState(false);

  useMemo(() => setDraft(settings), [settings]);

  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const onSave = () => {
    save({
      company_logo: draft.company_logo,
      light_logo: draft.light_logo,
      dark_logo: draft.dark_logo,
      primary_color: draft.primary_color,
      secondary_color: draft.secondary_color,
      accent_color: draft.accent_color,
      contact_email: draft.contact_email,
      contact_phone: draft.contact_phone,
      contact_whatsapp: draft.contact_whatsapp,
      contact_website: draft.contact_website,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const onReset = () => {
    save({
      company_logo: null,
      light_logo: null,
      dark_logo: null,
      primary_color: DEFAULT_ADMIN_SETTINGS.primary_color,
      secondary_color: DEFAULT_ADMIN_SETTINGS.secondary_color,
      accent_color: DEFAULT_ADMIN_SETTINGS.accent_color,
      contact_email: DEFAULT_ADMIN_SETTINGS.contact_email,
      contact_phone: DEFAULT_ADMIN_SETTINGS.contact_phone,
      contact_whatsapp: DEFAULT_ADMIN_SETTINGS.contact_whatsapp,
      contact_website: DEFAULT_ADMIN_SETTINGS.contact_website,
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Panel title="Logos" description="Visible to every partner across devices">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <LogoUploader label="Company logo" value={draft.company_logo} onChange={(v) => set("company_logo", v)} />
          <LogoUploader label="Light logo" value={draft.light_logo} onChange={(v) => set("light_logo", v)} variant="light" />
          <LogoUploader label="Dark logo" value={draft.dark_logo} onChange={(v) => set("dark_logo", v)} variant="dark" />
        </div>
      </Panel>

      <Panel title="Brand Colors" description="Primary palette used across DigiFormation surfaces">
        <div className="grid grid-cols-3 gap-3">
          <ColorPickerField label="Primary" value={draft.primary_color} onChange={(v) => set("primary_color", v)} />
          <ColorPickerField label="Secondary" value={draft.secondary_color} onChange={(v) => set("secondary_color", v)} />
          <ColorPickerField label="Accent" value={draft.accent_color} onChange={(v) => set("accent_color", v)} />
        </div>
        <div className="mt-5 rounded-xl p-5 border border-border/60" style={{ background: `linear-gradient(135deg, ${draft.primary_color}, ${draft.secondary_color})` }}>
          <div className="text-xs uppercase tracking-widest text-white/80">Preview</div>
          <div className="font-display text-2xl font-semibold text-white mt-1">DigiFormation</div>
          <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: draft.accent_color, color: "#0b0f1f" }}>
            <Layers className="h-3.5 w-3.5" /> Live preview
          </div>
        </div>
      </Panel>

      <Panel title="Company Contact Details" description="Shown on co-branded creatives by default" className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 gap-4">
          <ProfileField icon={<Mail className="h-3.5 w-3.5" />} label="Email">
            <Input value={draft.contact_email} onChange={(e) => set("contact_email", e.target.value)} className="bg-foreground/[0.03] pl-8" />
          </ProfileField>
          <ProfileField icon={<Phone className="h-3.5 w-3.5" />} label="Phone">
            <Input value={draft.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} className="bg-foreground/[0.03] pl-8" />
          </ProfileField>
          <ProfileField icon={<MessageCircle className="h-3.5 w-3.5" />} label="WhatsApp">
            <Input value={draft.contact_whatsapp} onChange={(e) => set("contact_whatsapp", e.target.value)} className="bg-foreground/[0.03] pl-8" />
          </ProfileField>
          <ProfileField icon={<Globe className="h-3.5 w-3.5" />} label="Website">
            <Input value={draft.contact_website} onChange={(e) => set("contact_website", e.target.value)} className="bg-foreground/[0.03] pl-8" />
          </ProfileField>
        </div>
      </Panel>

      <div className="lg:col-span-2 flex justify-end gap-2">
        <Button variant="outline" onClick={onReset}>Reset</Button>
        <Button onClick={onSave}>
          {saved ? <><Check className="h-4 w-4 mr-1.5" /> Saved</> : <><Save className="h-4 w-4 mr-1.5" /> Save branding</>}
        </Button>
      </div>
    </div>
  );
}

function LogoUploader({
  label,
  value,
  onChange,
  variant = "auto",
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  variant?: "auto" | "light" | "dark";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const bg =
    variant === "light"
      ? "bg-white"
      : variant === "dark"
        ? "bg-[oklch(0.12_0.04_260)]"
        : "bg-foreground/[0.04]";

  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className={cn("mt-1.5 aspect-square rounded-xl border border-border/60 overflow-hidden flex items-center justify-center p-4", bg)}>
        {value ? (
          <img src={value} alt={label} className="max-h-full max-w-full object-contain" />
        ) : (
          <ImageIc className={cn("h-6 w-6", variant === "light" ? "text-black/40" : "text-muted-foreground")} />
        )}
      </div>
      <div className="mt-2 flex gap-1">
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f || !user) return;
            try {
              const url = await uploadPartnerLogo(user.id, f);
              onChange(url);
            } catch (err) {
              console.error("logo upload failed", err);
            }
          }}
        />
        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => ref.current?.click()}>
          <Upload className="h-3 w-3 mr-1" /> Upload
        </Button>
        {value && (
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onChange(null)} title="Remove">
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

const PRESETS = ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#60a5fa", "#f472b6", "#ffffff"];

function ColorPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs flex items-center gap-1"><Palette className="h-3 w-3" /> {label}</Label>
      <div className="mt-1.5 flex items-center gap-2">
        <label className="h-9 w-9 rounded-lg border border-border/60 overflow-hidden cursor-pointer relative shrink-0" style={{ background: value }}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
        </label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-foreground/[0.03] font-mono text-xs uppercase" />
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn("h-5 w-5 rounded-md border transition", value.toLowerCase() === c.toLowerCase() ? "border-foreground/80 scale-110" : "border-border/60")}
            style={{ background: c }}
            aria-label={c}
          />
        ))}
      </div>
    </div>
  );
}

