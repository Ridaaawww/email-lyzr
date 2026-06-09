import { SignJWT, jwtVerify } from "jose";
import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  setCookie,
  deleteCookie,
  getRequestHeader,
} from "@tanstack/react-start/server";

export interface SessionUser {
  email: string;
  name: string;
  picture?: string;
}

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET env var is required");
  return new TextEncoder().encode(s);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return (payload as any).user as SessionUser;
  } catch {
    return null;
  }
}

/** Read the current session from the request cookie. */
export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => {
    const token = getCookie("session");
    if (!token) return null;
    return verifySession(token);
  }
);

/** Build the Google OAuth URL and return it for the caller to redirect to. */
export const buildGoogleAuthUrl = createServerFn({ method: "GET" }).handler(
  async (): Promise<string> => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error("GOOGLE_CLIENT_ID not configured");
    const proto = getRequestHeader("x-forwarded-proto") || "https";
    const host =
      getRequestHeader("x-forwarded-host") ||
      getRequestHeader("host") ||
      "localhost";
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${proto}://${host}/api/auth/callback`,
      response_type: "code",
      scope: "openid email profile",
      hd: "lyzr.ai",
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
);

/**
 * Exchange the Google OAuth code for a session.
 * Sets the session cookie on the current response and returns null on success,
 * or an error string on failure.
 */
export const exchangeGoogleCode = createServerFn({ method: "GET" })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }): Promise<string | null> => {
    const proto = getRequestHeader("x-forwarded-proto") || "https";
    const host =
      getRequestHeader("x-forwarded-host") ||
      getRequestHeader("host") ||
      "localhost";
    const origin = `${proto}://${host}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: data.code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin}/api/auth/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) return "token_exchange";

    const tokens = (await tokenRes.json()) as { access_token: string };

    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    if (!userRes.ok) return "user_info";

    const user = (await userRes.json()) as {
      email: string;
      name: string;
      picture?: string;
    };

    if (!user.email?.endsWith("@lyzr.ai")) return "unauthorized";

    const token = await signSession({
      email: user.email,
      name: user.name,
      picture: user.picture,
    });

    setCookie("session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return null; // success
  });

/** Clear the session cookie. */
export const clearSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<void> => {
    deleteCookie("session", { path: "/" });
  }
);
