import { createFileRoute, useSearch } from "@tanstack/react-router";

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
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#EBE5DC" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo mark + wordmark */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-semibold tracking-tight"
            style={{
              backgroundColor: "#6B4C4C",
              color: "#F9F5F1",
              boxShadow: "0 8px 32px rgba(40,20,10,.18)",
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400,
            }}
          >
            L
          </div>
          <div className="text-center">
            <h1
              className="text-[28px]"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 300,
                letterSpacing: "-0.03em",
                color: "#2A1F1A",
              }}
            >
              Lyzr Email Marketing
            </h1>
            <p
              className="mt-1.5 text-sm"
              style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign in to access your email intelligence dashboard.
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "#F2EDE8",
            border: "1px solid #D4CBC0",
            boxShadow: "0 4px 20px rgba(40,20,10,.07)",
          }}
        >
          {/* Error */}
          {errorMsg && (
            <div
              className="mb-5 rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(220,38,38,.08)",
                border: "1px solid rgba(220,38,38,.25)",
                color: "#DC2626",
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Google sign-in — mahogany pill button */}
          <a
            href="/api/auth/google"
            className="group flex w-full items-center justify-center gap-3 rounded-full px-6 py-3.5 text-sm font-medium transition-all"
            style={{
              backgroundColor: "#6B4C4C",
              color: "#F9F5F1",
              boxShadow: "0 4px 20px rgba(107,76,76,.30)",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#8A6060";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#6B4C4C";
            }}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" fillOpacity=".9" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" fillOpacity=".8" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" fillOpacity=".7" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" fillOpacity=".6" />
            </svg>
            Continue with Google
          </a>
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "#7A6A60", fontFamily: "'DM Sans', sans-serif" }}
        >
          Restricted to{" "}
          <span style={{ color: "#6B4C4C", fontWeight: 500 }}>@lyzr.ai</span>{" "}
          accounts only.
        </p>
      </div>
    </div>
  );
}
