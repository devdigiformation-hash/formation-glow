import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-lab")({
  beforeLoad: () => {
    throw redirect({ to: "/rebrand-studio" });
  },
});
