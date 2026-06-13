import { Link, useRouterState } from "@tanstack/react-router";
import { mobileBottomNav } from "./nav-items";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="mx-auto mb-3 max-w-md rounded-2xl glass-strong shadow-[var(--shadow-elevated)]">
        <ul className="flex items-center justify-between px-2 py-2">
          {mobileBottomNav.map((item) => {
            const active = pathname === item.url;
            const Icon = item.icon;
            return (
              <li key={item.url} className="flex-1">
                <Link
                  to={item.url}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-all tap-44 press",
                    active
                      ? item.ai
                        ? "text-ai"
                        : "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                      active && "bg-foreground/[0.06]"
                    )}
                    style={
                      active
                        ? {
                            boxShadow: item.ai
                              ? "var(--shadow-ai-glow)"
                              : "var(--shadow-glow)",
                          }
                        : undefined
                    }
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
