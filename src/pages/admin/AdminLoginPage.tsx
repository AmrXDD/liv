import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function AdminLoginPage() {
  const { user, loading, signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    return <Navigate to={loc.state?.from || "/admin/products"} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setErr(error);
    else nav(loc.state?.from || "/admin/products", { replace: true });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface-base p-6">
      <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-surface-raised p-10 shadow-elevation">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-500 text-bone-50 display-serif text-2xl">
            L
          </div>
          <div>
            <div className="display-serif text-2xl leading-none">Liv Functional</div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Admin sign in</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-ink/10 bg-surface-base px-4 py-3 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </div>
          {err && (
            <div className="rounded-xl bg-coral-100 px-4 py-3 text-sm text-coral-700">{err}</div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-forest-500 px-6 py-3.5 text-sm font-semibold text-bone-50 transition-colors hover:bg-forest-600 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-ink-muted">
          Create the admin user in Supabase Dashboard → Authentication → Users.
        </p>
      </div>
    </div>
  );
}
