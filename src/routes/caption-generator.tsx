import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/caption-generator")({
  beforeLoad: () => {
    throw redirect({ to: "/rebrand-studio" });
  },
});
