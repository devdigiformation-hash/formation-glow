import { createFileRoute } from "@tanstack/react-router";
import { Bell, CreditCard, Globe, Lock } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/ui-bits";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — DigiFormation" }] }),
  component: Settings,
});

function Settings() {
  return (
    <AppLayout title="Settings" subtitle="Manage your account, security, and preferences">
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Notifications" description="What you want to be alerted about">
          <div className="space-y-4">
            {[
              { label: "New confirmed orders", icon: Bell, on: true },
              { label: "Payouts processed", icon: CreditCard, on: true },
              { label: "New creatives in your niche", icon: Globe, on: false },
              { label: "Weekly performance digest", icon: Bell, on: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm flex-1">{s.label}</Label>
                <Switch defaultChecked={s.on} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Security" description="Lock down your account">
          <div className="space-y-4">
            {[
              { label: "Two-factor authentication", icon: Lock, on: true },
              { label: "Login alerts via email", icon: Bell, on: true },
              { label: "Require password for payouts", icon: Lock, on: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm flex-1">{s.label}</Label>
                <Switch defaultChecked={s.on} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Payout method" description="Where commissions are sent">
          <div className="rounded-xl p-4 bg-foreground/[0.03] border border-border/60 flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium">Bank transfer • GBP</div>
              <div className="text-xs text-muted-foreground">IBAN ending in •••• 4021</div>
            </div>
            <span className="text-xs font-medium text-success">Active</span>
          </div>
        </Panel>

        <Panel title="Preferences" description="Localization and display">
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between"><span>Language</span><span className="text-muted-foreground">English</span></div>
            <div className="flex items-center justify-between"><span>Currency</span><span className="text-muted-foreground">GBP (£)</span></div>
            <div className="flex items-center justify-between"><span>Timezone</span><span className="text-muted-foreground">UTC+01:00 — Lisbon</span></div>
          </div>
        </Panel>
      </div>
    </AppLayout>
  );
}
