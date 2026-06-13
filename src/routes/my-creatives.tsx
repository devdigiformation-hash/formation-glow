import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/my-creatives")({
  beforeLoad: () => {
    throw redirect({ to: "/rebrand-studio" });
  },
});
