import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Play, Download, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/ui-bits";
import { LabHero, SegregationNote } from "@/components/lab-hub";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/ai-audio-lab")({
  head: () => ({ meta: [{ title: "AI Audio Lab — DigiFormation" }] }),
  component: AudioLab,
});

const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer", "coral", "verse", "ballad", "ash", "sage"] as const;

function TTSPanel() {
  const [text, setText] = useState("Welcome to DigiFormation — your AI marketing co-pilot.");
  const [voice, setVoice] = useState<string>("alloy");
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = () => {
    if (!text.trim()) return;
    setLoading(true);
    const u = `https://text.pollinations.ai/${encodeURIComponent(text.trim())}?model=openai-audio&voice=${voice}`;
    setUrl(u);
    setLoading(false);
  };

  return (
    <Panel title="Text-to-Speech" description="Powered by Pollinations openai-audio — free, no key required.">
      <div className="space-y-4">
        <div>
          <Label className="text-xs">Script</Label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="mt-1.5 bg-foreground/[0.03]" />
        </div>
        <div>
          <Label className="text-xs">Voice</Label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger className="mt-1.5 bg-foreground/[0.03] capitalize"><SelectValue /></SelectTrigger>
            <SelectContent>
              {VOICES.map((v) => <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Generate audio
        </Button>
        {url && (
          <div className="rounded-xl border border-border/60 p-3 bg-foreground/[0.02] space-y-2">
            <audio src={url} controls className="w-full" />
            <a href={url} download="digiformation-tts.mp3" className="inline-flex items-center gap-1.5 text-xs text-ai hover:underline">
              <Download className="h-3.5 w-3.5" /> Download MP3
            </a>
          </div>
        )}
      </div>
    </Panel>
  );
}

function AudioLab() {
  return (
    <AppLayout title="AI Audio Lab" subtitle="Voice, narration and audio generation">
      <LabHero
        title="Give your content a voice"
        description="Turn scripts into audio with a single click — generated inside DigiFormation."
        icon={<Mic className="h-6 w-6" />}
      />
      <SegregationNote kind="integrated" />
      <div className="mt-6">
        <TTSPanel />
      </div>
    </AppLayout>
  );
}
