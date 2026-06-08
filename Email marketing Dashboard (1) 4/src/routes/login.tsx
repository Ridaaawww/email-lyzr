import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Lyzr Email Marketing" }] }),
  component: LoginPage,
});

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "Only @lyzr.ai accounts can access this tool.",
  access_denied: "Sign-in was cancelled. Try again.",
  token_exchange: "Authentication failed. Please try again.",
  user_info: "Could not retrieve your profile. Please try again.",
};

function LoginPage() {
  const search = useSearch({ strict: false }) as { error?: string };
  const errorMsg = search.error ? ERROR_MESSAGES[search.error] ?? "Something went wrong." : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Mail className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Lyzr Email Marketing</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with your Lyzr account to access your email metrics.
            </p>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMsg}
          </div>
        )}

        {/* Sign in button */}
        <a
          href="/api/auth/google"
          className="flex w-full items-center justify-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </a>

        <p className="text-center text-xs text-muted-foreground">
          Access is restricted to <span className="font-medium">@lyzr.ai</span> accounts only.
        </p>
      </div>
    </div>
  );
}
