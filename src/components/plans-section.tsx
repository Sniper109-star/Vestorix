import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { INVESTMENT_PLANS, formatRange, formatRoi } from "@/lib/plans";

export function PlansSection() {
  return (
    <section id="plans" className="mt-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Investment plans
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/60">
          Choose a plan that fits your goals. Every plan is reviewed and
          activated by our team after you fund your account.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {INVESTMENT_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col rounded-2xl border p-5 ${
              plan.highlight
                ? "border-emerald-400/40 bg-emerald-500/[0.06]"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              {plan.highlight && (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  Popular
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-white/55">{plan.tagline}</p>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Return
              </p>
              <p className="text-3xl font-semibold text-emerald-300">
                {formatRoi(plan)}
              </p>
            </div>

            <div className="mt-4 space-y-1 text-sm text-white/60">
              <p>
                <span className="text-white/40">Range: </span>
                {formatRange(plan)}
              </p>
              {plan.assets && (
                <p className="flex flex-wrap gap-1.5 pt-1">
                  {plan.assets.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/70"
                    >
                      ${a}
                    </span>
                  ))}
                </p>
              )}
            </div>

            <div className="mt-6 pt-4">
              <ButtonLink
                href="/register"
                variant={plan.highlight ? "primary" : "ghost"}
                className="w-full"
              >
                Invest in {plan.name}
              </ButtonLink>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
