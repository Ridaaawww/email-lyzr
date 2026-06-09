import { createFileRoute, redirect } from "@tanstack/react-router";
import { exchangeGoogleCode } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/callback")({
  loader: async ({ location }) => {
    const search = location.search as Record<string, string | undefined>;
    const code = search["code"];
    const error = search["error"];

    if (error || !code) {
      throw redirect({ to: "/login", search: { error: "access_denied" } });
    }

    // exchangeGoogleCode sets the session cookie server-side, returns null on success
    const authError = await exchangeGoogleCode({ data: { code } });
    if (authError) {
      throw redirect({ to: "/login", search: { error: authError } });
    }

    throw redirect({ to: "/" });
  },
  component: () => null,
});
