# Active Context: Apex Invest — Web3 Investment Platform

## Current State

**Status**: ✅ Full-stack investment platform built on the Next.js 16 starter.

The app is a web3 investment platform: users register, link an EVM wallet, view
balances (on-chain via web3.js + in-app USD balance), deposit (with tx hash) and
request withdrawals. An unlinked, admin-only console at `/admin` reviews and
approves/rejects transactions. Emails via Resend.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Admin console rebuilt with **react-admin** (marmelab/react-admin):
  custom DataProvider -> existing /api/admin/* routes, dashboard stats,
  UserList + TransactionList with approve/reject. Loaded client-only via
  next/dynamic (ssr:false).

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page | ✅ Ready |
| `src/app/layout.tsx` | Root layout | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

The template is ready. Next steps depend on user requirements:

1. What type of application to build
2. What features are needed
3. Design/branding preferences

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-07-07 | Built full web3 investment platform: auth, user dashboard (overview/deposit/withdraw/profile/transactions), hidden /admin console, web3.js balances, Resend emails, JSON store + seed script |
| 2026-07-07 | Scaffolded 4 core integrations into the repo: (1) multi-chain support — `src/lib/integrations/chains.ts` with Ethereum/Base/Polygon/Arbitrum/Sepolia + Chainlink feed registry; (2) wallet connection — `src/lib/integrations/wallet.ts` (EIP-6963/EIP-1193 injected + WalletConnect via `@walletconnect/ethereum-provider`) + `WalletConnectButton`, wired into dashboard header; (3) fiat on-ramp — `src/lib/integrations/onramp.ts` (Coinbase + Stripe) + `OnrampWidget`, `POST /api/onramp/session`, wired into deposit page; (4) Chainlink price oracle — `src/lib/integrations/price-oracle.ts` + `PriceTicker` + `GET /api/prices`, wired into dashboard overview. Added `.env.example` with integration keys. Removed "Powered by web3.js · Resend · Convex-style backend" attribution from landing page. |
| 2026-07-07 | Rebuilt /admin console with react-admin (custom DataProvider over /api/admin/*, dashboard, UserList, TransactionList approve/reject) |
