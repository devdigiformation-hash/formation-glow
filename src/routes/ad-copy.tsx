import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ad-copy")({
  beforeLoad: () => {
    throw redirect({ to: "/rebrand-studio" });
  },
});
