import { SUPPORTED_CHAINS } from "@/lib/integrations/chains";

export function SupportedNetworks() {
  return (
    <div className="flex flex-wrap gap-2">
      {SUPPORTED_CHAINS.filter((c) => !c.testnet).map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70"
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
          {c.name}
        </span>
      ))}
    </div>
  );
}
