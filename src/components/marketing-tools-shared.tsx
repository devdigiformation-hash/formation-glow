import { useEffect, useState, useCallback, type ReactNode } from "react";
import { Copy, Check, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { generateMarketing, type MarketingInput, type MarketingOutput } from "@/lib/marketing-ai.functions";
import { useServices, useAIUsage } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// ============================================================================
// Shared building blocks for Marketing Tools.
// ============================================================================

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 text-xs"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          /* noop */
        }
      }}
    >
      {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export function GenerateButton({
  loading,
  onClick,
  label = "Generate",
  hasResult = false,
}: {
  loading: boolean;
  onClick: () => void;
  label?: string;
  hasResult?: boolean;
}) {
  return (
    <Button onClick={onClick} disabled={loading} className="w-full bg-ai text-ai-foreground hover:bg-ai/90">
      {loading ? (
        <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating…</>
      ) : hasResult ? (
        <><RefreshCw className="h-4 w-4 mr-1.5" /> Regenerate</>
      ) : (
        <><Sparkles className="h-4 w-4 mr-1.5" /> {label}</>
      )}
    </Button>
  );
}

export function ServiceSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const { data: services } = useServices();
  const active = services.filter((s) => s.is_active);
  return (
    <div>
      <Label className="text-xs">Service</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1.5 bg-foreground/[0.03]">
          <SelectValue placeholder="Pick a DigiFormation service" />
        </SelectTrigger>
        <SelectContent>
          {active.map((s) => (
            <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Auto-select a service from `?service=<name>` querystring.
export function useServiceFromQuery(initial: string = "") {
  const [service, setService] = useState(initial);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const s = sp.get("service");
    if (s) setService(s);
  }, []);
  return [service, setService] as const;
}

// Wrapped runner that logs AI usage automatically.
export function useMarketingRunner() {
  const call = useServerFn(generateMarketing);
  const { log } = useAIUsage();
  return useCallback(
    async (input: MarketingInput): Promise<MarketingOutput> => {
      try {
        const result = await call({ data: input });
        await log({ provider: "gemini", model: "google/gemini-2.5-flash", success: true });
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "AI request failed";
        await log({ provider: "gemini", model: "google/gemini-2.5-flash", success: false, error_message: msg });
        throw e;
      }
    },
    [call, log],
  );
}

export function ResultCard({
  title,
  copyText,
  children,
}: {
  title: string;
  copyText: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl p-3.5 bg-foreground/[0.03] border border-border/60">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold">{title}</span>
        <CopyButton text={copyText} />
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
      {message}
    </div>
  );
}
