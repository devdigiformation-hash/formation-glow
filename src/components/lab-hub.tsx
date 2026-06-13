import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, type LucideIcon } from "lucide-react";
import { Panel, PlaceholderHero } from "@/components/ui-bits";
import { Badge } from "@/components/ui/badge";

export type LabTile = {
  title: string;
  description: string;
  icon: LucideIcon;
  to?: string;
  href?: string;
  badge?: string;
  external?: boolean;
};

export function LabHero({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return <PlaceholderHero ai title={title} description={description} icon={icon} />;
}

export function TileGrid({ tiles }: { tiles: LabTile[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {tiles.map((t) => {
        const Inner = (
          <Panel className="h-full transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-ai-glow)]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center">
                <t.icon className="h-5 w-5" />
              </div>
              {t.badge && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-ai/30 text-ai">
                  {t.badge}
                </Badge>
              )}
              {t.external ? (
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              ) : (
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <h3 className="font-display text-base font-semibold mt-3">{t.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
          </Panel>
        );
        if (t.href) {
          return (
            <a key={t.title} href={t.href} target="_blank" rel="noopener noreferrer" className="group">
              {Inner}
            </a>
          );
        }
        return (
          <Link key={t.title} to={t.to!} className="group">
            {Inner}
          </Link>
        );
      })}
    </div>
  );
}

export function SegregationNote({ kind }: { kind: "integrated" | "external" }) {
  const isInt = kind === "integrated";
  return (
    <div
      className={
        "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium " +
        (isInt
          ? "bg-success/10 text-success border border-success/30"
          : "bg-warning/10 text-warning border border-warning/30")
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {isInt ? "Integrated AI Tools — run inside DigiFormation" : "External AI Resources — open in a new tab"}
    </div>
  );
}
