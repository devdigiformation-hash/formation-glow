import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/marketing-pack")({
  beforeLoad: () => {
    throw redirect({ to: "/rebrand-studio" });
  },
});
