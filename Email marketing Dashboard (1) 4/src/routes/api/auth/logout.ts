import { createFileRoute, redirect } from "@tanstack/react-router";
import { clearSession } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/logout")({
  loader: async () => {
    await clearSession();
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
