"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    walletAddress: "",
  });

  const isRegister = mode === "register";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister
            ? form
            : { email: form.email, password: form.password },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400/60";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="text-lg font-semibold">
          <span className="text-emerald-400">◆</span> Apex Invest
        </Link>
        <h1 className="mt-4 text-2xl font-bold">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {isRegister
            ? "Start investing on-chain in minutes."
            : "Sign in to your dashboard."}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        {isRegister && (
          <div>
            <label className="mb-1 block text-sm text-white/70">Full name</label>
            <input
              className={field}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Satoshi N"
              required
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-white/70">Email</label>
          <input
            type="email"
            className={field}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/70">Password</label>
          <input
            type="password"
            className={field}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={isRegister ? "At least 8 characters" : "••••••••"}
            required
          />
        </div>
        {isRegister && (
          <div>
            <label className="mb-1 block text-sm text-white/70">
              Wallet address <span className="text-white/30">(optional)</span>
            </label>
            <input
              className={field}
              value={form.walletAddress}
              onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
              placeholder="0x…"
            />
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-white/50">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-300 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/register" className="text-emerald-300 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </main>
  );
}
