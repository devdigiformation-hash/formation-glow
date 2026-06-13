import { useState, type ReactNode } from "react";
import { Menu, Bell, Search } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppLayout({ title, subtitle, actions, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh w-full safe-x">
      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-dvh">
        <AppSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass-strong border-b border-border/60 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden -ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <AppSidebar onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg sm:text-xl font-semibold truncate leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <Search className="h-[18px] w-[18px]" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
              </Button>
              {actions}
            </div>
          </div>
        </header>

        <main key={title} className="flex-1 px-4 sm:px-6 py-5 sm:py-6 pb-32 lg:pb-8 max-w-7xl w-full mx-auto animate-rise-in safe-x">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
