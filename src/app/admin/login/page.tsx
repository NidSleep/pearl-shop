import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";

export default async function AdminLogin({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await getAdminUser()) redirect("/admin/orders");
  const params = await searchParams;
  const error = params.error === "unavailable"
    ? "Sign-in is temporarily unavailable. Please try again shortly."
    : params.error ? "Could not sign in. Check your email, password and admin access." : null;

  return (
    <div className="admin-login space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl">Admin sign in</h1>
        <p className="text-sm text-stone-600">Sign in to view and review customer orders.</p>
      </div>
      {error && <p role="alert" className="error-message">{error}</p>}
      <form action="/admin/login/submit" method="post" className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required maxLength={254}
            className="field" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024}
            className="field" />
        </div>
        <button type="submit" className="button w-full">
          Sign in
        </button>
      </form>
    </div>
  );
}
