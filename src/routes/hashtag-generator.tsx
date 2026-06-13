import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hashtag-generator")({
  beforeLoad: () => {
    throw redirect({ to: "/rebrand-studio" });
  },
});
