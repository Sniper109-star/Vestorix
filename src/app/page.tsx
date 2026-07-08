import Link from "next/link";
import { ButtonLink, Card } from "@/components/ui";
import { PlansSection } from "@/components/plans-section";

const features = [
  {
    title: "On-chain wallet",
    body: "Connect an EVM wallet and read live balances through web3.js. Your keys never leave your device.",
  },
  {
    title: "Deposits & withdrawals",
    body: "Submit crypto deposits with a transaction hash, request withdrawals to any address — all reviewed by our team.",
  },
  {
    title: "Balance dashboard",
    body: "Track your portfolio value, pending activity and full transaction history in one place.",
  },
  {
    title: "Secure by design",
    body: "HTTP-only session cookies, scrypt password hashing and a separate, unlinked admin console.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-emerald-950">
            ◆
          </span>
          Apex Invest
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/70 hover:text-white">
            Sign in
          </Link>
          <ButtonLink href="/register">Get started</ButtonLink>
        </div>
      </nav>

      <section className="mt-20 text-center">
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Invest on-chain with a dashboard you can trust
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-white/60">
          A full-stack investment platform where users deposit and withdraw crypto,
          monitor balances, and manage their profile — all from a clean dashboard.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <ButtonLink href="/register">Create account</ButtonLink>
          <ButtonLink href="/login" variant="ghost">
            I already have an account
          </ButtonLink>
        </div>
      </section>

      <section className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <Card key={f.title}>
            <h3 className="text-lg font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-white/60">{f.body}</p>
          </Card>
        ))}
      </section>

      <PlansSection />

      <footer className="mt-24 border-t border-white/10 pt-8 text-center text-xs text-white/40">
        Apex Invest · Demo platform. Not financial advice.
      </footer>
    </main>
  );
}
