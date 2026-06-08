import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/auth/logout")({
  GET: async ({ request }) => {
    const origin = new URL(request.url).origin;
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/login`,
        "Set-Cookie": "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
      },
    });
  },
});
