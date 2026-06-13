import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  Trash2,
  Loader2,
  User,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Menu,
  Plus,
  MessageSquare,
  X,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Panel, PlaceholderHero } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  sendToSmartAgent,
  getSmartAgentStatus,
  type ChatMessage,
  type ProviderStatus,
} from "@/lib/smart-agent.functions";
import { useAIUsage } from "@/lib/data";
import digiformationLogo from "@/assets/digiformation-logo.png.asset.json";

export const Route = createFileRoute("/smart-agent")({
  head: () => ({
    meta: [
      { title: "DigiFormation AI Assistant" },
      { name: "description", content: "Your DigiFormation expert — company formation, banking, payments, compliance, marketing & sales." },
    ],
  }),
  component: SmartAgent,
});

const THREADS_KEY = "digiformation.smart-agent.threads.v1";
const ACTIVE_KEY = "digiformation.smart-agent.active.v1";

type Thread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

type Suggestion = { icon: string; title: string; desc: string; prompt: string };
const SUGGESTIONS: Suggestion[] = [
  { icon: "🇬🇧", title: "Explain UK LTD Formation", desc: "Step-by-step setup for non-residents", prompt: "Explain UK LTD Formation step by step for a non-resident founder." },
  { icon: "🇺🇸", title: "Explain US LLC Formation", desc: "Which state, EIN, BOI and banking", prompt: "Explain US LLC formation — best state for a non-resident, EIN, BOI and banking." },
  { icon: "💳", title: "How do I get Stripe?", desc: "Eligibility, docs, fastest path", prompt: "How do I get Stripe approved for a non-resident? List documents and the fastest path." },
  { icon: "🏦", title: "Wise vs Payoneer", desc: "Which one for my business?", prompt: "Compare Wise vs Payoneer for an Amazon FBA seller. Which should I pick?" },
  { icon: "🛒", title: "Best bank for Amazon FBA", desc: "Get paid + pay suppliers", prompt: "Which bank should I use for an Amazon FBA business and why?" },
  { icon: "📈", title: "Build a 7-day marketing plan", desc: "Find clients this week", prompt: "Build me a 7-day marketing plan to find clients for UK LTD formation." },
];

function uid() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadThreads(): { threads: Thread[]; activeId: string | null } {
  if (typeof window === "undefined") return { threads: [], activeId: null };
  try {
    const raw = window.localStorage.getItem(THREADS_KEY);
    const threads = raw ? (JSON.parse(raw) as Thread[]) : [];
    const activeId = window.localStorage.getItem(ACTIVE_KEY);
    return { threads: Array.isArray(threads) ? threads : [], activeId };
  } catch {
    return { threads: [], activeId: null };
  }
}

function saveThreads(threads: Thread[]) {
  try { window.localStorage.setItem(THREADS_KEY, JSON.stringify(threads)); } catch { /* noop */ }
}
function saveActive(id: string | null) {
  try {
    if (id) window.localStorage.setItem(ACTIVE_KEY, id);
    else window.localStorage.removeItem(ACTIVE_KEY);
  } catch { /* noop */ }
}

function deriveTitle(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 48 ? t.slice(0, 48) + "…" : t || "New chat";
}

function stripMarkdown(s: string): string {
  return s
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|\s)\*(?!\s)(.+?)\*(?!\w)/g, "$1$2")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ");
}

async function copyText(text: string, label = "Copied") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Could not copy");
  }
}

function SmartAgent() {
  return (
    <AppLayout
      title="DigiFormation AI Assistant"
      subtitle="Your DigiFormation expert — company formation, banking, payments, compliance, marketing & sales."
    >
      <ChatCoach />
    </AppLayout>
  );
}

function CoachAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      className="shrink-0 rounded-full overflow-hidden ring-1 ring-border/60 bg-background grid place-items-center"
      style={{ width: size, height: size }}
    >
      <img
        src={digiformationLogo.url}
        alt="DigiFormation"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function ChatCoach() {
  const send = useServerFn(sendToSmartAgent);
  const getStatus = useServerFn(getSmartAgentStatus);
  const { log } = useAIUsage();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Bootstrap threads (idempotent, no useEffect-created blank threads)
  useEffect(() => {
    const { threads: t, activeId: a } = loadThreads();
    setThreads(t);
    setActiveId(a && t.some((x) => x.id === a) ? a : t[0]?.id ?? null);
    getStatus().then(setStatus).catch(() => setStatus({ active: null, available: [], ready: false }));
  }, [getStatus]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId],
  );
  const messages = activeThread?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading, activeId]);

  const newChat = () => {
    setActiveId(null);
    setError(null);
    saveActive(null);
    setHistoryOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const selectThread = (id: string) => {
    setActiveId(id);
    saveActive(id);
    setError(null);
    setHistoryOpen(false);
  };

  const deleteThread = (id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveThreads(next);
      if (id === activeId) {
        const nextId = next[0]?.id ?? null;
        setActiveId(nextId);
        saveActive(nextId);
      }
      return next;
    });
  };

  const clearAll = () => {
    setThreads([]);
    setActiveId(null);
    saveThreads([]);
    saveActive(null);
  };

  const submit = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setError(null);

    // Ensure we have an active thread
    let thread = activeThread;
    let id = activeId;
    if (!thread) {
      id = uid();
      thread = { id, title: deriveTitle(content), messages: [], updatedAt: Date.now() };
    }

    const userMsg: ChatMessage = { role: "user", content };
    const nextMessages: ChatMessage[] = [...thread.messages, userMsg];
    const updatedThread: Thread = {
      ...thread,
      title: thread.messages.length === 0 ? deriveTitle(content) : thread.title,
      messages: nextMessages,
      updatedAt: Date.now(),
    };

    setThreads((prev) => {
      const exists = prev.some((t) => t.id === updatedThread.id);
      const next = exists
        ? prev.map((t) => (t.id === updatedThread.id ? updatedThread : t))
        : [updatedThread, ...prev];
      saveThreads(next);
      return next;
    });
    setActiveId(id);
    saveActive(id);
    setInput("");
    setLoading(true);

    try {
      const r = await send({ data: { messages: nextMessages } });
      const assistant: ChatMessage = { role: "assistant", content: stripMarkdown(r.reply) };
      setThreads((prev) => {
        const next = prev.map((t) =>
          t.id === updatedThread.id
            ? { ...t, messages: [...nextMessages, assistant], updatedAt: Date.now() }
            : t,
        );
        saveThreads(next);
        return next;
      });
      await log({ provider: r.provider, model: r.model, success: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed.";
      setError(msg);
      await log({
        provider: status?.active ?? "smart_agent",
        model: "smart-agent",
        success: false,
        error_message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const notReady = status !== null && !status.ready;
  const empty = messages.length === 0;
  const sortedThreads = useMemo(
    () => [...threads].sort((a, b) => b.updatedAt - a.updatedAt),
    [threads],
  );

  return (
    <>
      {/* Top toolbar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Menu className="h-4 w-4" /> History
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[86vw] sm:w-[360px] p-0 flex flex-col">
            <SheetHeader className="px-4 py-3 border-b border-border/60">
              <SheetTitle className="text-base">Chat history</SheetTitle>
            </SheetHeader>
            <div className="p-3">
              <Button onClick={newChat} className="w-full justify-start gap-2" variant="secondary">
                <Plus className="h-4 w-4" /> New chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
              {sortedThreads.length === 0 && (
                <div className="text-xs text-muted-foreground px-3 py-6 text-center">
                  No saved chats yet.
                </div>
              )}
              {sortedThreads.map((t) => {
                const isActive = t.id === activeId;
                return (
                  <div
                    key={t.id}
                    className={`group flex items-center gap-1 rounded-lg pr-1 ${
                      isActive ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.04]"
                    }`}
                  >
                    <button
                      onClick={() => selectThread(t.id)}
                      className="flex-1 min-w-0 flex items-center gap-2 px-2.5 py-2 text-left"
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{t.title}</span>
                    </button>
                    <button
                      onClick={() => deleteThread(t.id)}
                      aria-label="Delete chat"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            {sortedThreads.length > 0 && (
              <div className="p-3 border-t border-border/60">
                <Button onClick={clearAll} variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear all
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Button onClick={newChat} variant="ghost" size="sm" className="text-xs gap-1.5">
            <Plus className="h-4 w-4" /> New
          </Button>
          <Link to="/marketing-guide">
            <Button variant="outline" size="sm" className="text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Guide
            </Button>
          </Link>
        </div>
      </div>

      {empty && (
        <PlaceholderHero
          ai
          title="Your DigiFormation AI Assistant is ready"
          description="Ask about UK LTD, US LLC, banking, Stripe, PayPal, VAT, marketing, sales — anything DigiFormation."
          icon={<Sparkles className="h-6 w-6" />}
        />
      )}

      {notReady && (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
          <div>
            <div className="font-semibold">DigiFormation AI Assistant is ready for provider integration.</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Configure a provider key to enable conversations.
            </div>
          </div>
        </div>
      )}

      <Panel className="mt-4 p-0 overflow-hidden">
        <div
          ref={scrollRef}
          className="h-[58vh] min-h-[360px] overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-5 space-y-4"
        >
          {empty && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-6">
              <div
                className="h-14 w-14 rounded-2xl grid place-items-center text-white shadow-[var(--shadow-brand-glow)] animate-breathing-glow"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold">How can I help you today?</div>
                <div className="text-xs text-muted-foreground mt-1">Pick a topic or ask anything about DigiFormation.</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => submit(s.prompt)}
                    disabled={loading || notReady}
                    style={{ animationDelay: `${80 * i}ms` }}
                    className="animate-rise-in text-left px-3.5 py-3 rounded-xl glass border border-border/60 hover:border-ai/40 hover:bg-foreground/[0.04] transition disabled:opacity-50"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="text-lg leading-none mt-0.5">{s.icon}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold leading-tight">{s.title}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <Bubble key={i} message={m} />
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <CoachAvatar />
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 sm:px-6 pb-3">
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} aria-label="Dismiss">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="p-3 sm:p-4">
          <div className="relative rounded-3xl border border-border/60 bg-background/80 backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] focus-within:border-ai/50 focus-within:ring-2 focus-within:ring-ai/20 transition">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={notReady ? "Configure a provider to start chatting…" : "Ask anything…"}
              disabled={loading || notReady}
              rows={1}
              className="min-h-[56px] max-h-44 resize-none border-0 bg-transparent px-4 py-4 pr-14 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            />
            <Button
              onClick={() => submit()}
              disabled={loading || !input.trim() || notReady}
              size="icon"
              className="absolute right-2 bottom-2 h-9 w-9 rounded-full bg-ai text-ai-foreground hover:bg-ai/90 shadow-md disabled:opacity-40"
              aria-label="Send"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-2 px-1 text-[10px] text-muted-foreground/60 flex items-center justify-between">
            <span>Enter to send · Shift+Enter for new line · English, Urdu, Roman Urdu supported</span>
            {status?.active && <span className="truncate">{status.active.replace(/_/g, " ")}</span>}
          </div>
        </div>
      </Panel>
    </>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const text = isUser ? message.content : stripMarkdown(message.content);
  const looksLikePlan = !isUser && /day\s*\d/i.test(text);

  return (
    <div className={`flex gap-2.5 sm:gap-3 animate-rise-in w-full ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <div className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center bg-ai/20 text-ai">
          <User className="h-3.5 w-3.5" />
        </div>
      ) : (
        <CoachAvatar />
      )}
      <div
        className={`min-w-0 max-w-[82%] sm:max-w-[78%] flex flex-col gap-1.5 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          dir="auto"
          className={
            isUser
              ? "rounded-2xl rounded-tr-md px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] bg-ai text-ai-foreground shadow-sm max-w-full"
              : "rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] bg-foreground/[0.04] border border-border/60 text-foreground max-w-full"
          }
        >
          {text}
        </div>
        {!isUser && (
          <div className="flex gap-1.5">
            <CopyChip text={text} label="Copy" />
            {looksLikePlan && <CopyChip text={text} label="Copy full plan" />}
          </div>
        )}
      </div>
    </div>
  );
}

function CopyChip({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        await copyText(text, `${label}d`);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-border/60 hover:bg-foreground/[0.04] active:scale-95 transition press"
    >
      {done ? (
        <>
          <Check className="h-3 w-3 text-emerald-500 animate-copy-pop" />
          <span className="animate-copy-pop">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
