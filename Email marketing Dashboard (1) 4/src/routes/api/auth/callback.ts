import { createAPIFileRoute } from "@tanstack/react-start/api";
import { signSession } from "~/lib/auth";

export const APIRoute = createAPIFileRoute("/api/auth/callback")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error || !code) {
      return Response.redirect(`${url.origin}/login?error=access_denied`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${url.origin}/api/auth/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return Response.redirect(`${url.origin}/login?error=token_exchange`);
    }

    const tokens = await tokenRes.json() as { access_token: string };

    // Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      return Response.redirect(`${url.origin}/login?error=user_info`);
    }

    const user = await userRes.json() as { email: string; name: string; picture?: string; hd?: string };

    // Enforce @lyzr.ai domain — even if Google hd hint is bypassed
    if (!user.email?.endsWith("@lyzr.ai")) {
      return Response.redirect(`${url.origin}/login?error=unauthorized`);
    }

    const token = await signSession({
      email: user.email,
      name: user.name,
      picture: user.picture,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
      },
    });
  },
});
