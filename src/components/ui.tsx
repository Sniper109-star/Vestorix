import Link from "next/link";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-medium uppercase tracking-wide text-white/50">{children}</h3>;
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <Card>
      <CardTitle>{label}</CardTitle>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      {hint ? <div className="mt-1 text-xs text-white/40">{hint}</div> : null}
    </Card>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/10 text-white/70",
    green: "bg-emerald-500/15 text-emerald-300",
    amber: "bg-amber-500/15 text-amber-300",
    red: "bg-red-500/15 text-red-300",
    blue: "bg-sky-500/15 text-sky-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary:
      "bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-semibold",
    ghost:
      "border border-white/15 text-white/80 hover:bg-white/5",
    danger: "bg-red-500/90 text-white hover:bg-red-500",
  };
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm transition ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
