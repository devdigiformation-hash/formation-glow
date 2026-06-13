import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-assistant-center")({
  beforeLoad: () => {
    throw redirect({ to: "/smart-agent" });
  },
});
