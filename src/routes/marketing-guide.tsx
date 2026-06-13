import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Check, ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { PlaceholderHero } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import {
  getGuideCards,
  cardToPlainText,
  CATEGORY_META,
  type GuideCard,
  type GuideCategory,
  type GuideLang,
} from "@/lib/knowledge/growth-guide";
import { markSoftSignal } from "@/lib/knowledge/journey-kb";

export const Route = createFileRoute("/marketing-guide")({
  head: () => ({
    meta: [
      { title: "Marketing Guide — DigiFormation" },
      { name: "description", content: "Step-by-step training: Facebook, WhatsApp, sales, content and lead generation." },
    ],
  }),
  component: MarketingGuidePage,
});

async function copyText(text: string, label = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Could not copy");
  }
}

const DONE_KEY = "digiformation.marketing-guide.done.v2";
const LANG_KEY = "digiformation.marketing-guide.lang.v1";
function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const stepKey = (cardId: string, idx: number) => `${cardId}::${idx}`;

function MarketingGuidePage() {
  const [lang, setLang] = useState<GuideLang>(() => load<GuideLang>(LANG_KEY, "en"));
  const [activeCat, setActiveCat] = useState<GuideCategory>("getting-started");
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>(() => load<string[]>(DONE_KEY, []));

  const allCards = useMemo(() => getGuideCards(lang), [lang]);
  const cards = useMemo(() => allCards.filter((c) => c.category === activeCat), [allCards, activeCat]);

  const totalSteps = allCards.reduce((n, c) => n + c.steps.length, 0);
  const doneCount = done.filter((k) => allCards.some((c) => c.steps.some((_, i) => stepKey(c.id, i) === k))).length;
  const pct = totalSteps ? Math.round((doneCount / totalSteps) * 100) : 0;

  const setLangPersist = (l: GuideLang) => { setLang(l); save(LANG_KEY, l); };
  const toggleStep = (cardId: string, idx: number) => {
    const k = stepKey(cardId, idx);
    const next = done.includes(k) ? done.filter((x) => x !== k) : [...done, k];
    setDone(next);
    save(DONE_KEY, next);
    if (!done.includes(k)) markSoftSignal("guideOpened");
  };


  return (
    <AppLayout
      title="Marketing Guide"
      subtitle="Step-by-step training — open a topic, follow each step."
    >
      <PlaceholderHero
        title="Tell me exactly what to do next"
        description="Bite-sized steps. Check them off as you complete each one."
        icon={<BookOpen className="h-6 w-6" />}
      />

      {/* Progress + language */}
      <div className="mt-4 rounded-2xl glass border border-border/60 p-4">
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Training Progress</div>
            <div className="text-[11px] font-medium tabular mt-0.5">
              {doneCount} of {totalSteps} steps completed <span className="text-muted-foreground">· {pct}%</span>
            </div>
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-foreground/[0.04] border border-border/60">
            <LangBtn active={lang === "en"} onClick={() => setLangPersist("en")}>English</LangBtn>
            <LangBtn active={lang === "ur"} onClick={() => setLangPersist("ur")}>اردو</LangBtn>
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-foreground/[0.08] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "var(--gradient-brand)" }} />
        </div>
      </div>

      {/* Category pills */}
      <div className="mt-4 -mx-1 px-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 min-w-max pb-1">
          {CATEGORY_META.map((c) => {
            const active = c.id === activeCat;
            return (
              <button
                key={c.id}
                onClick={() => { setActiveCat(c.id); setOpenCard(null); }}
                className={cn(
                  "shrink-0 px-3 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow)]"
                    : "bg-foreground/[0.03] border-border/60 text-foreground/80 hover:border-primary/40"
                )}
              >
                <span>{c.emoji}</span>
                <span>{lang === "ur" ? c.labelUr : c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion list */}
      <div className="mt-4 space-y-2">
        {cards.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
            More guides coming to this track.
          </div>
        )}
        {cards.map((card) => (
          <GuideAccordion
            key={card.id}
            card={card}
            lang={lang}
            isOpen={openCard === card.id}
            onToggle={() => setOpenCard(openCard === card.id ? null : card.id)}
            done={done}
            toggleStep={toggleStep}
          />
        ))}
      </div>
    </AppLayout>
  );
}

function LangBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
        active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function GuideAccordion({
  card, lang, isOpen, onToggle, done, toggleStep,
}: {
  card: GuideCard;
  lang: GuideLang;
  isOpen: boolean;
  onToggle: () => void;
  done: string[];
  toggleStep: (cardId: string, idx: number) => void;
}) {
  const rtl = lang === "ur";
  const cardDone = card.steps.filter((_, i) => done.includes(stepKey(card.id, i))).length;
  const total = card.steps.length;
  const complete = cardDone === total;

  return (
    <div className={cn(
      "rounded-2xl border bg-foreground/[0.02] overflow-hidden transition-all",
      isOpen ? "border-primary/40 shadow-[var(--shadow-glow)]" : "border-border/60 hover:border-primary/30"
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="text-2xl shrink-0">{card.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-display font-semibold text-sm truncate">{card.title}</div>
            {complete && (
              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Check className="h-2.5 w-2.5" /> Done
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate" dir={rtl ? "rtl" : "ltr"}>
            {cardDone}/{total} steps · {card.subtitle}
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="border-t border-border/60 px-3 pt-3 pb-3 space-y-2" dir={rtl ? "rtl" : "ltr"}>
          {card.steps.map((s, i) => {
            const k = stepKey(card.id, i);
            const isDone = done.includes(k);
            return (
              <div
                key={i}
                className={cn(
                  "rounded-xl border p-3 transition-colors",
                  isDone ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-border/60 bg-background/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStep(card.id, i)}
                    aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                    className={cn(
                      "mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-all",
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border/80 hover:border-primary"
                    )}
                  >
                    {isDone && <Check className="h-3 w-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                        Step {i + 1}
                      </div>
                    </div>
                    <div className={cn("text-sm font-medium", isDone && "line-through opacity-60")}>{s.title}</div>
                    <p className={cn("text-[13px] leading-relaxed text-foreground/80 mt-1 whitespace-pre-line", isDone && "opacity-60")}>
                      {s.body}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <button
                        onClick={() => copyText(`${s.title}\n${s.body}`, "Step copied")}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-1">
            <button
              onClick={() => copyText(cardToPlainText(card), "Guide copied")}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3 w-3" /> Copy full guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
