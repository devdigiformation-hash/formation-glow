import { Link, useRouterState } from "@tanstack/react-router";
import logoAsset from "@/assets/digiformation-logo.png.asset.json";
import { navGroups, logoutNavItem } from "./nav-items";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin, profile, user } = useAuth();
  const groups = navGroups.filter((g) => g.label !== "Admin" || isAdmin);

  const displayName = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Partner";
  const brand = profile?.brand_name?.trim() || (isAdmin ? "Administrator" : "DigiFormation Partner");
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DP";

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl ring-1 ring-sidebar-border bg-background" style={{ boxShadow: "var(--shadow-glow)" }}>
          <img src={logoAsset.url} alt="DigiFormation logo" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-sm font-semibold tracking-tight">DigiFormation</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Affiliate Hub</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.url;
                const Icon = item.icon;
                return (
                  <li key={item.url}>
                    <Link
                      to={item.url}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active && (item.ai ? "text-ai" : "text-primary")
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                      {item.ai && (
                        <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-ai/90 px-1.5 py-0.5 rounded bg-ai/10">
                          AI
                        </span>
                      )}
                      {active && (
                        <span
                          className="ml-auto h-1.5 w-1.5 rounded-full"
                          style={{ background: item.ai ? "var(--color-ai)" : "var(--color-primary)" }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="m-3 rounded-xl p-4 glass space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground truncate">{brand}</div>
          </div>
        </div>
        <Link
          to={logoutNavItem.url}
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-all border border-sidebar-border/60"
        >
          <logoutNavItem.icon className="h-3.5 w-3.5" />
          {logoutNavItem.title}
        </Link>
      </div>
    </aside>
  );
}
