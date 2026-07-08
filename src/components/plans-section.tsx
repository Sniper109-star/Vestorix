import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { INVESTMENT_PLANS, formatRange, formatRoi } from "@/lib/plans";

const ICONS: Record<string, React.ReactNode> = {
  solana: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.2c-.6-1.4-1.9-2.2-3.5-2.2S7.6 7.8 7 9.2c-.5 1.3.2 2.2 1.4 2.6-.9.5-1.4 1.3-1.2 2.3.4 1.3 1.7 2 3.3 2 1.6 0 2.9-.6 3.4-2 .5-1.2-.2-2.1-1.4-2.6.9-.5 1.4-1.3 1.2-2.3z" />
    </>
  ),
  plant: (
    <>
      <path d="M12 22V8" />
      <path d="M12 8C9 8 7 6 7 3c3 0 5 2 5 5z" />
      <path d="M12 11c3 0 5-2 5-5-3 0-5 2-5 5z" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </>
  ),
  trending: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M17 7h4v4" />
    </>
  ),
};

function PlanIcon({ name }: { name: string }) {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {ICONS[name] ?? ICONS.trending}
      </svg>
    </span>
  );
}

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
              <PlanIcon name={plan.icon} />
              {plan.highlight && (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  Popular
                </span>
              )}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              {plan.name}
            </h3>
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
                      {a}
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
