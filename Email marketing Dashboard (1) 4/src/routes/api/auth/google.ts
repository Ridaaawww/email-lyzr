import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/auth/google")({
  GET: async ({ request }) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return new Response("GOOGLE_CLIENT_ID not configured", { status: 500 });

    const origin = new URL(request.url).origin;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${origin}/api/auth/callback`,
      response_type: "code",
      scope: "openid email profile",
      hd: "lyzr.ai",
      prompt: "select_account",
    });

    return Response.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    );
  },
});
