import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/prompt-vault")({
  beforeLoad: () => {
    throw redirect({ to: "/rebrand-studio" });
  },
});
