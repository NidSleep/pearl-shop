import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_OPTIONS, isSameOriginAdminPost, requireAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isSameOriginAdminPost(request)) return new Response("Invalid request", { status: 403 });
  await requireAdmin();
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(ADMIN_COOKIE, "", {
    ...ADMIN_COOKIE_OPTIONS, secure: process.env.NODE_ENV === "production", maxAge: 0,
  });
  return response;
}
