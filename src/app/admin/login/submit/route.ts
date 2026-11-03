import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_OPTIONS, isSameOriginAdminPost, verifyAdminToken } from "@/lib/admin-auth";
import { createAuthClient } from "@/lib/supabase";

function loginError(request: Request, reason: "invalid" | "unavailable") {
  const response = NextResponse.redirect(new URL(`/admin/login?error=${reason}`, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: Request) {
  if (!isSameOriginAdminPost(request)) return new Response("Invalid request", { status: 403 });
  const form = await request.formData().catch(() => null);
  const email = form?.get("email");
  const password = form?.get("password");
  if (typeof email !== "string" || !email.trim() || email.length > 254 ||
      typeof password !== "string" || !password || password.length > 1024) {
    return loginError(request, "invalid");
  }
  try {
    const { data, error } = await createAuthClient().auth.signInWithPassword({ email: email.trim(), password });
    const session = data.session;
    if (error || !session || !await verifyAdminToken(session.access_token)) return loginError(request, "invalid");
    const maxAge = (session.expires_at ?? 0) - Math.floor(Date.now() / 1000);
    if (maxAge <= 0) return loginError(request, "invalid");
    const response = NextResponse.redirect(new URL("/admin/orders", request.url), 303);
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(ADMIN_COOKIE, session.access_token, {
      ...ADMIN_COOKIE_OPTIONS, secure: process.env.NODE_ENV === "production", maxAge,
    });
    return response;
  } catch {
    console.warn("admin login: authentication unavailable");
    return loginError(request, "unavailable");
  }
}
