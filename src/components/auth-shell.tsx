import type { ReactNode } from "react";
import logoAsset from "@/assets/digiformation-logo.png.asset.json";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-dvh w-full grid place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl ring-1 ring-border bg-background"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <img src={logoAsset.url} alt="DigiFormation logo" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold tracking-tight">DigiFormation</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Affiliate Hub</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-7 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
          </div>
          {children}
        </div>

        {footer && <div className="mt-5">{footer}</div>}
      </div>
    </div>
  );
}
