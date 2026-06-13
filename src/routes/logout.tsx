import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/context";

export const Route = createFileRoute("/logout")({
  head: () => ({ meta: [{ title: "Signing out — DigiFormation" }] }),
  component: Logout,
});

function Logout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await signOut();
      if (!cancelled) navigate({ to: "/auth/login", replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [signOut, navigate]);

  return (
    <div className="min-h-dvh grid place-items-center bg-background">
      <div className="text-sm text-muted-foreground">Signing you out…</div>
    </div>
  );
}
