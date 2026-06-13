import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/whatsapp-messages")({
  beforeLoad: () => {
    throw redirect({ to: "/smart-agent" });
  },
});
