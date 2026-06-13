import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, ExternalLink, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui-bits";
import { Badge } from "@/components/ui/badge";
import { EXTERNAL_TOOLS, buildPromptFor, type PromptInput, type ExternalTool } from "@/lib/external-prompts";
import { fetchExternalPromptContext, parseKnowledgeJson, type ExternalPromptContext } from "@/lib/knowledge.functions";
import { buildExternalPromptBlock } from "@/lib/knowledge/serialize";

export function ExternalAIDeck({ input, onFlash }: { input: PromptInput; onFlash?: (m: string) => void }) {
  const [copied, setCopied] = useState<ExternalTool | null>(null);
  const fetchCtx = useServerFn(fetchExternalPromptContext);

  // Pull DB-driven DigiFormation knowledge so each prompt includes live
  // service + package + marketing context (replacing hardcoded knowledge).
  const { data: dbContextBlock } = useQuery({
    queryKey: ["external-prompt-ctx", input.serviceSlug ?? null],
    queryFn: async () => {
      try {
        const payload = await fetchCtx({ data: { serviceSlug: input.serviceSlug } });
        const ctx = parseKnowledgeJson<ExternalPromptContext>(payload);
        return buildExternalPromptBlock(ctx);
      } catch {
        return ""; // safe fallback — buildPromptFor will use legacy block
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const enriched: PromptInput = { ...input, dbContextBlock: dbContextBlock || input.dbContextBlock };

  const handleCopy = async (tool: ExternalTool) => {
    const prompt = buildPromptFor(tool, enriched);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(tool);
      onFlash?.(`${tool} prompt copied`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      onFlash?.("Copy failed");
    }
  };

  return (
    <Panel
      title="Generate with external AI"
      description="Use your own free account on any of these tools. DigiFormation credits are NOT consumed."
    >
      <div className="mb-3 flex items-start gap-2 text-[11px] text-muted-foreground rounded-md bg-foreground/[0.03] border border-border/60 p-2.5">
        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
        <span>
          Each card builds a tool-specific prompt with your brand, contact info and live DigiFormation service knowledge already inside. Copy it, open the tool, paste, and generate.
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {EXTERNAL_TOOLS.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-border/60 bg-foreground/[0.02] p-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-display font-semibold text-sm">{t.label}</div>
              <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                Free account
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">{t.bestFor}</p>
            <p className="text-[10px] text-muted-foreground/70">{t.note}</p>
            <div className="flex gap-1.5 mt-1 min-w-0">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 min-w-0 h-8 text-[11px] px-2"
                onClick={() => handleCopy(t.id)}
              >
                {copied === t.id ? (
                  <><Check className="h-3 w-3 mr-1 shrink-0" /> <span className="truncate">Copied</span></>
                ) : (
                  <><Copy className="h-3 w-3 mr-1 shrink-0" /> <span className="truncate">Copy Prompt</span></>
                )}
              </Button>
              <Button asChild size="sm" className="flex-1 min-w-0 h-8 text-[11px] px-2">
                <a href={t.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1 shrink-0" />
                  <span className="truncate">Open</span>
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
