import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase";

export const ADMIN_COOKIE = "pearl-admin-access";
export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/admin",
};

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "").split(",").map((entry) => entry.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

/** Verify with Auth on every request; never authorize from decoded JWT claims. */
export async function verifyAdminToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { data, error } = await createAuthClient().auth.getUser(token);
    return !error && data.user && isAdminEmail(data.user.email) ? data.user : null;
  } catch {
    console.warn("admin auth: verification unavailable");
    return null;
  }
}

export async function getAdminUser() {
  return verifyAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** Form POSTs require Origin, including scheme/port, before touching Auth. */
export function isSameOriginAdminPost(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
