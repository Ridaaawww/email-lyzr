import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
  redirect,
} from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalFilters } from "@/components/global-filters";
import { FiltersProvider } from "@/lib/filters-context";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient; user?: SessionUser }>()({
  beforeLoad: async ({ location }) => {
    if (location.pathname.startsWith("/login") || location.pathname.startsWith("/api/auth")) {
      return {};
    }
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
    return { user };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lyzr Email Marketing" },
      { name: "description", content: "Email marketing analytics, deliverability, and AI insights for growth teams." },
      { property: "og:title", content: "Lyzr Email Marketing" },
      { name: "twitter:title", content: "Lyzr Email Marketing" },
      { property: "og:description", content: "Email marketing analytics, deliverability, and AI insights for growth teams." },
      { name: "twitter:description", content: "Email marketing analytics, deliverability, and AI insights for growth teams." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/8644da83-6eb9-452e-8b89-32c21d90d1f8" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/8644da83-6eb9-452e-8b89-32c21d90d1f8" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, user } = Route.useRouteContext();

  if (!user) return <Outlet />;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <QueryClientProvider client={queryClient}>
      <FiltersProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
              <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
                <SidebarTrigger />
                <div className="relative ml-2 hidden max-w-xs flex-1 lg:block">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search…" className="h-9 pl-8" />
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="icon" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <ThemeToggle />
                  <div className="ml-2 flex items-center gap-2">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {initials}
                      </div>
                    )}
                    <a href="/api/auth/logout" title={`Sign out (${user.email})`}>
                      <Button variant="ghost" size="icon" aria-label="Sign out">
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </header>
              <div className="sticky top-14 z-20 flex flex-wrap items-center gap-2 border-b bg-background/80 px-4 py-2 backdrop-blur">
                <GlobalFilters />
              </div>
              <main className="flex-1 p-6">
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </FiltersProvider>
    </QueryClientProvider>
  );
}
