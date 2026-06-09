import { createFileRoute, redirect } from "@tanstack/react-router";
import { buildGoogleAuthUrl } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/google")({
  loader: async () => {
    const url = await buildGoogleAuthUrl();
    throw redirect({ href: url, statusCode: 302 } as any);
  },
  component: () => null,
});
