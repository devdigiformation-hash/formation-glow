import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/commissions")({
  beforeLoad: () => {
    throw redirect({ to: "/earnings" });
  },
});
