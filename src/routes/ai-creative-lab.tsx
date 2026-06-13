import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-creative-lab")({
  beforeLoad: () => {
    throw redirect({ to: "/rebrand-studio" });
  },
});
