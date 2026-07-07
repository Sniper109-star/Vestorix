# Apex Invest — Web3 Investment Platform

A full-stack, on-chain investment platform where users register, link an EVM
wallet, deposit and withdraw crypto, and track balances — backed by an
admin-only console for reviewing and approving transactions. Built on the
Next.js 16 App Router with React 19, Tailwind CSS 4, and react-admin.

> Repository: `Sniper109-star/Vestorix`

---

## Features

- **Auth & accounts** — email/password registration and login with scrypt
  password hashing and cookie-based sessions (7-day TTL).
- **User dashboard** — overview with balances and recent activity, deposit,
  withdrawal, profile (wallet linking), and transaction history.
- **On-chain reads** — native balances read directly from chain via `web3.js`
  (`src/lib/web3.ts`), no third-party indexer required.
- **Deposits & withdrawals** — users submit requests (deposits carry an
  optional tx hash); an admin reviews and approves/rejects them. Approving a
  deposit credits the user's USD balance; approving a withdrawal debits it.
- **Admin console** — unlinked, admin-only `react-admin` UI at `/admin`
  (`src/components/admin`) with a dashboard, user list, and transaction
  approve/reject queue, served over a custom DataProvider that talks to the
  existing `/api/admin/*` routes.
- **Integrations** (see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)):
  - **Multi-chain support** — Ethereum, Base, Polygon, Arbitrum, Sepolia
    (`src/lib/integrations/chains.ts`).
  - **Wallet connection** — EIP-6963 / EIP-1193 injected wallets plus
    WalletConnect (`src/lib/integrations/wallet.ts`).
  - **Fiat on-ramp** — Coinbase Onramp + Stripe Crypto Onramp
    (`src/lib/integrations/onramp.ts`).
  - **Chainlink price oracle** — on-chain AggregatorV3 feeds
    (`src/lib/integrations/price-oracle.ts`).
- **Email notifications** — transactional emails via Resend
  (`src/lib/email.ts`); gracefully disabled when no API key is set.

---

## Tech Stack

| Layer        | Technology                                   |
|--------------|----------------------------------------------|
| Framework    | Next.js 16 (App Router, React Server Components) |
| UI           | React 19, Tailwind CSS 4                     |
| Admin UI     | react-admin 5                                |
| Web3         | web3.js 4 (`@walletconnect/ethereum-provider`) |
| Email        | Resend                                       |
| Auth         | Node `crypto` (scrypt hashing, random tokens) |
| Persistence  | JSON file store (`src/lib/store.ts`)         |
| Language     | TypeScript (strict)                          |

> **Persistence note:** The default store is a JSON file (`.data/db.json`),
> chosen for zero-config scaffolding. For production, swap `src/lib/store.ts`
> for a real database — see `.kilocode/recipes/add-database.md`.

---

## Getting Started

### Prerequisites

- Node 20+ / Bun 1.3+
- (Optional) API keys for Resend, WalletConnect, Coinbase Onramp, Stripe

### Install

```bash
bun install
```

### Environment

Copy `.env.example` to `.env.local` and fill in what you need (all are
optional — features degrade gracefully when unset):

```bash
cp .env.example .env.local
```

| Variable                          | Purpose                                       |
|-----------------------------------|-----------------------------------------------|
| `WEB3_RPC_URL`                    | Default RPC endpoint for on-chain reads        |
| `RESEND_API_KEY`                  | Enables transactional email                    |
| `RESEND_FROM`                     | From-address for emails                        |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project id          |
| `COINBASE_ONRAMP_PROJECT_ID`      | Coinbase Onramp partner project id            |
| `COINBASE_ONRAMP_API_KEY`         | Coinbase Onramp API key                       |
| `STRIPE_SECRET_KEY`               | Stripe Crypto Onramp secret key               |
| `STRIPE_ONRAMP_API_BASE`          | Stripe API base (default `https://api.stripe.com`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`  | Seed admin credentials                         |
| `USER_EMAIL` / `USER_PASSWORD`    | Seed demo user credentials                     |

### Seed the database

```bash
bun run seed
```

Default seeded accounts:

- Admin: `admin@invest.app` / `Admin@1234`
- User:  `user@invest.app`  / `User@1234`

### Run

The dev server is managed by the sandbox; locally you can run:

```bash
bun dev        # next dev
```

Then open `http://localhost:3000`. Sign in with a seeded account, or visit
`/admin` while authenticated as an admin.

---

## Scripts

| Script              | Description                                  |
|---------------------|----------------------------------------------|
| `bun dev`           | Start the Next.js dev server                 |
| `bun build`         | Production build (`next build`)              |
| `bun start`         | Start the production server                  |
| `bun lint`          | ESLint                                       |
| `bun typecheck`     | `tsc --noEmit`                               |
| `bun run seed`      | Seed admin + demo users into the JSON store  |

---

## How It Works

### Authentication & sessions

- Passwords are hashed with **scrypt** + random salt
  (`src/lib/password.ts`); never stored or compared in plaintext.
- On login, a 32-byte random session token is created
  (`src/lib/auth.ts`) and set as the `inv_session` cookie (HttpOnly,
  sameSite). `getUserFromCookie()` resolves the current user on the server.
- `assertUser` / `assertAdmin` guard API routes and pages.

### Deposits & withdrawals

1. A user submits a deposit (`POST /api/deposit`) or withdrawal
   (`POST /api/withdraw`). The request is stored as a `pending` transaction
   and the user is emailed.
2. An admin opens `/admin` → Transactions and clicks **Approve** or
   **Reject** (`POST /api/admin/transactions/[id]`).
3. On approval:
   - deposits credit the user's USD balance,
   - withdrawals debit it (rejected if insufficient),
   and the user receives a confirmation email.

### Admin console

The `/admin` route renders an `AdminApp` loaded **client-only** via
`next/dynamic` (`ssr: false`). A custom `adminDataProvider`
(`src/lib/admin-data-provider.ts`) bridges react-admin to the existing
`/api/admin/*` REST endpoints, so no new backend code is needed for the UI.

### Integrations

| Integration        | Library / File                                      | Entry point(s)                              |
|--------------------|-----------------------------------------------------|---------------------------------------------|
| Multi-chain config | `src/lib/integrations/chains.ts`                    | chain registry + Chainlink feed map         |
| Wallet connect     | `src/lib/integrations/wallet.ts`                    | `WalletConnectButton` (dashboard header)    |
| Fiat on-ramp       | `src/lib/integrations/onramp.ts`                    | `OnrampWidget`, `POST /api/onramp/session`  |
| Price oracle       | `src/lib/integrations/price-oracle.ts`             | `PriceTicker`, `GET /api/prices`           |

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full data flow.

---

## Project Structure

```
src/
  app/
    page.tsx                 # Landing page
    layout.tsx               # Root layout
    login/ register/         # Auth pages
    dashboard/               # User area (overview, deposit, withdraw, profile, transactions)
    admin/                   # react-admin console (client-only)
    api/
      auth/                  # login, logout, register, me
      deposit/ withdraw/     # Transaction submission
      transactions/          # User transaction history
      profile/               # Wallet linking
      web3/balance/          # On-chain balance read
      admin/*                # Admin stats, users, transactions (approve/reject)
      onramp/session/        # Fiat on-ramp session creation
      prices/                # Chainlink price feed read
  components/
    ui.tsx                   # Card, Stat, Badge, ButtonLink
    auth-form.tsx profile-form.tsx dashboard-sidebar.tsx
    wallet-connect.tsx onramp-widget.tsx price-ticker.tsx chain-selector.tsx
    admin/                   # AdminApp, AdminLoader
  lib/
    auth.ts store.ts password.ts email.ts web3.ts format.ts types.ts
    admin-data-provider.ts
    integrations/            # chains, wallet, onramp, price-oracle
scripts/seed.ts              # Seed users
.kilocode/recipes/           # Feature recipes (e.g. add-database)
```

---

## API Reference

All API routes return JSON. Auth-guarded routes require the `inv_session`
cookie; admin routes additionally require an `admin` role.

| Method | Route                              | Auth        | Description                              |
|--------|------------------------------------|-------------|------------------------------------------|
| POST   | `/api/auth/register`               | public      | Create account                           |
| POST   | `/api/auth/login`                  | public      | Authenticate, set session cookie         |
| POST   | `/api/auth/logout`                 | user        | Destroy session                          |
| GET    | `/api/auth/me`                     | user        | Current user                             |
| POST   | `/api/deposit`                     | user        | Submit deposit (→ `pending`)             |
| POST   | `/api/withdraw`                    | user        | Submit withdrawal (→ `pending`)          |
| GET    | `/api/transactions`                | user        | Caller's transactions                    |
| PATCH  | `/api/profile`                     | user        | Link/update wallet address               |
| GET    | `/api/web3/balance?address=`       | public      | Native balance via web3.js               |
| GET    | `/api/admin/stats`                 | admin       | Platform stats                           |
| GET    | `/api/admin/users`                 | admin       | User list                                |
| GET    | `/api/admin/transactions`          | admin       | Transaction list (enriched w/ user)      |
| POST   | `/api/admin/transactions/[id]`     | admin       | Approve/reject a transaction             |
| POST   | `/api/onramp/session`              | public*     | Create Coinbase/Stripe on-ramp session   |
| GET    | `/api/prices`                      | public      | Chainlink price feeds (15s revalidate)   |

`*` The on-ramp endpoint validates the destination wallet address but does not
require auth; protect it further if needed.

---

## Security Notes

- Passwords use scrypt with a per-user salt; verification uses a constant-time
  compare (`timingSafeEqual`).
- Session tokens are 256-bit random values; sessions expire after 7 days.
- Server actions guard every protected route with `assertUser` / `assertAdmin`.
- The JSON store is fine for development. **Do not** use it in production
  without replacing `src/lib/store.ts` with a real database (see the
  add-database recipe).
- All secrets live in environment variables; `.env*` is git-ignored.

---

## Deployment

The app is a standard Next.js project and deploys to any Node host or Vercel.

1. `bun install`
2. Set environment variables (see above).
3. `bun run build && bun start`
4. Run `bun run seed` once to create the initial admin.

For persistent storage, migrate the JSON store to a database before going live.
