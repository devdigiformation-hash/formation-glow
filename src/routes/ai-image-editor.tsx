import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-image-editor")({
  beforeLoad: () => {
    throw redirect({ to: "/rebrand-studio" });
  },
});
