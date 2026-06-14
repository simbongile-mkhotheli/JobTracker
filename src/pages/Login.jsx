import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const DEMO_CREDENTIALS = {
  email: "admin@admin.com",
  password: "123456",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSigningIn, setIsAutoSigningIn] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSignIn(nextEmail, nextPassword) {
    setIsLoading(true);
    setError("");

    try {
      await signIn(nextEmail, nextPassword);

      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setIsLoading(false);
      setIsAutoSigningIn(false);
    }
  }

  function fillDemoCredentials() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError("");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsAutoSigningIn(true);
      setEmail(DEMO_CREDENTIALS.email);
      setPassword(DEMO_CREDENTIALS.password);
      void handleSignIn(
        DEMO_CREDENTIALS.email,
        DEMO_CREDENTIALS.password,
      );
    }, 800);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await handleSignIn(email, password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070d1a] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your JobTracker dashboard.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
          <p className="text-sm font-medium text-cyan-100">
            Recruiter demo access
          </p>
          <p className="mt-1 text-xs leading-5 text-cyan-100/80">
            The demo account will log in automatically after the screen loads.
          </p>

          <button
            type="button"
            onClick={fillDemoCredentials}
            className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25"
          >
            Fill demo credentials
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="mb-2 block text-sm text-slate-300"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm text-slate-300"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isAutoSigningIn}
            className="h-11 w-full rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAutoSigningIn || isLoading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-sky-300 hover:text-sky-200">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}