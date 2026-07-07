# Architecture

This document describes the internal architecture of **Apex Invest** (repo:
`Sniper109-star/Vestorix`). It complements the [README](../README.md) and is
intended for developers extending the platform.

---

## 1. High-Level Overview

```
                          ┌─────────────────────────────┐
        Browser  ───────▶ │  Next.js 16 App Router       │
                          │  (React Server Components)   │
                          │                              │
   ┌──────────────┐       │  ┌────────────────────────┐  │
   │ Dashboard UI │◀──────┤  │  Pages (/app/**)        │  │
   │ (RSC + CC)   │       │  └───────────┬────────────┘  │
   └──────────────┘       │              │                │
        │  ┌──────────────┤  ┌───────────▼────────────┐  │
        └──▶│ /admin      │  │  API Routes (/app/api) │  │
            │ react-admin │  └───┬───────────┬────────┘  │
            └──────────────┘     │           │           │
                                 │           │           │
                   ┌─────────────▼──┐   ┌────▼─────────┐  │
                   │ lib/ (domain)  │   │ integrations │  │
                   │ auth, store,   │   │ wallet,       │  │
                   │ email, web3    │   │ onramp,       │  │
                   └───────┬───────┘   │ price-oracle, │  │
                           │           │ chains        │  │
                   ┌───────▼───────┐   └──────┬────────┘  │
                   │ Data store    │          │           │
                   │ (.data/db.json)          │           │
                   └───────────────┘   ┌──────▼────────┐  │
                                       │ External:      │
                                       │ RPC / Chainlink│
                                       │ Resend / WC    │
                                       │ Coinbase/Stripe│
                                       └────────────────┘
```

The server is the single trust boundary. All business logic lives in
`src/lib`, and all mutation/listening of protected data goes through API
routes that validate auth and input before touching the store.

---

## 2. Layered Design

| Layer            | Location                 | Responsibility                                  |
|------------------|--------------------------|-------------------------------------------------|
| Presentation     | `src/app/**`, `src/components` | Pages, forms, admin UI, client widgets    |
| API / Boundary   | `src/app/api/**`         | Auth checks, input validation, orchestration    |
| Domain / Lib     | `src/lib/**`             | Auth, persistence, email, web3, integrations    |
| Data             | `.data/db.json`          | Users, sessions, transactions (JSON store)      |
| External         | RPC, Chainlink, Resend, WalletConnect, on-ramp providers | Side-effecting I/O        |

### Server vs. Client Components

- Pages under `/dashboard` and `/admin` are **Server Components** by default —
  they read the session cookie (`getUserFromCookie`) and query the store
  directly on the server.
- Interactive pieces are marked `"use client"`: `wallet-connect.tsx`,
  `onramp-widget.tsx`, `price-ticker.tsx`, `auth-form.tsx`, `profile-form.tsx`,
  and the `react-admin` `AdminApp`.
- The admin app is loaded with `next/dynamic` and `ssr: false`
  (`src/components/admin/AdminLoader.tsx`) because react-admin is a
  client-only library.

---

## 3. Data Model

Defined in `src/lib/types.ts`:

```ts
type Role = "user" | "admin";
type TxStatus = "pending" | "approved" | "rejected";
type TxType = "deposit" | "withdrawal";

interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;     // scrypt "salt:derived"
  role: Role;
  walletAddress: string | null;
  balance: number;          // USD-equivalent balance
  createdAt: string;
}

interface Session { token: string; userId: string; expiresAt: number; }

interface Transaction {
  id: string;
  userId: string;
  type: TxType;
  amount: number;
  asset: string;
  status: TxStatus;
  txHash: string | null;    // deposit proof
  address: string | null;   // withdrawal destination
  note: string | null;      // admin note
  createdAt: string;
  processedAt: string | null;
  processedBy: string | null;
}
```

### Store (`src/lib/store.ts`)

- A single JSON document (`users`, `sessions`, `transactions`) read/written
  via `readDB` / `writeDB`.
- A `mutate(fn)` helper applies an in-place transform and persists atomically
  (per-call; not multi-process safe — acceptable for dev).
- The exported `db` object exposes typed `get*`, `create*`, `update*` methods.
- Location: `.data/db.json` (git-ignored). Seed via `bun run seed`.

> **Why JSON?** Zero-config scaffolding. The store interface is the only thing
> to replace when moving to a real database — see
> `.kilocode/recipes/add-database.md`. No page or API route imports the file
> format directly; they go through `db`.

---

## 4. Authentication & Authorization

Files: `src/lib/auth.ts`, `src/lib/password.ts`.

- **Hashing** — `hashPassword` generates a 16-byte random salt + 64-byte scrypt
  derived key, stored as `salt:hex`. `verifyPassword` compares with
  `timingSafeEqual`.
- **Sessions** — `createSession` stores a `randomBytes(32)` token + `expiresAt`
  (7 days). The token is returned to the client as the `inv_session` cookie
  (set in the login route).
- **Resolution** — `getUserFromCookie()` reads the cookie, validates the
  session, and returns a `PublicUser` (password fields stripped via
  `toPublicUser`).
- **Guards** — `assertUser` (any authenticated user) and `assertAdmin`
  (role === "admin") are thrown inside API routes / server pages; the route
  catches them and returns 403/401.

```
login ─▶ verifyPassword ─▶ createSession ─▶ set inv_session cookie
request ─▶ getUserFromCookie ─▶ assertUser/assertAdmin ─▶ handler
logout ─▶ deleteSession ─▶ clear cookie
```

---

## 5. Transaction Lifecycle

```
         User                      API                     Store / Email
          │                         │                            │
 deposit ─┼─ POST /api/deposit ───▶ │ validate + create tx       │
          │                         ├──────────────────────────▶ │ tx(pending)
          │                         ├─ notifyDepositSubmitted ──▶ │ email
 withdraw �┼─ POST /api/withdraw ──▶ │ check balance, create tx   │
          │                         ├──────────────────────────▶ │ tx(pending)
          │                         ├─ notifyWithdrawalRequested▶ │ email
          │                         │                            │
 Admin    │                         │                            │
 approve ─┼─ POST /api/admin/       │ assertAdmin                 │
          │     transactions/[id] ─┤   reject → status=rejected  │
          │                         ┤   approve:                  │
          │                         ┤     deposit  → +balance     │
          │                         ┤     withdraw→ -balance     │
          │                         ├─ notify*Approved ─────────▶ │ email
```

- Validation: deposits accept an optional 64-hex `txHash`; withdrawals require
  a valid `0x…` 20-byte address and sufficient balance at submit time.
- Approval is idempotent — already-processed transactions return `409`.
- Emails are fire-and-forget (`.catch(() => {})`) so a mail failure never
  blocks the transaction.

---

## 6. Admin Console

- Route `/admin` (`src/app/admin/page.tsx`) renders `AdminLoader`, which
  dynamically imports `AdminApp` client-side.
- `adminDataProvider` (`src/lib/admin-data-provider.ts`) implements the
  react-admin `DataProvider` interface against the existing `/api/admin/*`
  routes (`getList`, `getOne`, `getMany`, `getManyReference`). Mutations are
  intentionally unsupported — all writes happen through the
  approve/reject endpoint.
- `AdminApp` defines:
  - `AdminDashboard` — stats from `GET /api/admin/stats`.
  - `UserList` — read-only user grid.
  - `TransactionList` — grid + inline **Approve/Reject** buttons that call
    `POST /api/admin/transactions/[id]`.
- Auth is pass-through client-side; real enforcement is server-side via
  `assertAdmin` on every `/api/admin/*` route.

---

## 7. Integrations

All integration code lives under `src/lib/integrations/` and is designed to be
drop-in and env-gated (no keys → graceful degradation).

### 7.1 Multi-chain (`chains.ts`)

- `SUPPORTED_CHAINS` — Ethereum, Base, Polygon, Arbitrum (mainnet) + Sepolia
  (testnet), each with RPC URL, explorer, currency, and brand color.
- `CHAINLINK_FEEDS` — registry of AggregatorV3 proxy addresses per chain.
- `AGGREGATOR_V3_ABI` — minimal `latestRoundData` / `decimals` ABI.
- Helpers: `getChain(id)`, `getChainByKey(key)`, `isSupportedChain`.

### 7.2 Wallet connection (`wallet.ts`)

- `discoverInjectedWallets()` + `listenEip6963()` — EIP-6963 provider
  discovery (MetaMask, Rabby, Coinbase, etc.).
- `connectInjected()` — EIP-1193 `eth_requestAccounts`.
- `switchChain()` — `wallet_switchEthereumChain` with `wallet_addEthereumChain`
  fallback (code `4902`).
- `personalSign()` — SIWE-style message signing helper.
- `createWalletConnectConnector(projectId)` — lazy `import()` of
  `@walletconnect/ethereum-provider` so the heavy dependency is only loaded in
  the browser when WalletConnect is used.
- UI: `WalletConnectButton` (dashboard header) shows discovered wallets,
  connection state (short address), chain selector, and disconnect.

### 7.3 Fiat on-ramp (`onramp.ts`)

- `OnrampProvider = "coinbase" | "stripe"`.
- `createCoinbaseOnrampUrl()` — builds a hosted Coinbase Onramp buy URL with
  `destinationWallets`, asset/currency/amount, and `appId`.
- `createStripeOnrampSession()` — server-side `POST` to Stripe's
  `crypto/onramp_sessions` using `STRIPE_SECRET_KEY`, returning a redirect URL.
- `createOnrampSession(req)` dispatches by provider and returns `{ url }`.
- API: `POST /api/onramp/session` validates the destination address and
  dispatches; returns the provider URL the client redirects to.
- UI: `OnrampWidget` (deposit page) lets the user pick a provider, asset, and
  amount.

### 7.4 Chainlink price oracle (`price-oracle.ts`)

- `getPriceFeed(chainId, feedAddress, decimals)` — instantiates a `web3.eth.Contract`
  on the chain's RPC and reads `latestRoundData()`, converting `answer` by
  `decimals`.
- `getAllPriceFeeds()` — iterates `CHAINLINK_FEEDS`, tolerating per-feed
  failures (returns `price: 0` on error so the UI degrades gracefully).
- `getTokenPrices(symbols)` — convenience lookup by asset symbol.
- API: `GET /api/prices` (ISR `revalidate = 15`) returns all feeds.
- UI: `PriceTicker` polls every 30s and renders the latest prices.
- `Web3` clients are cached per chain in a module-level `Map`.

---

## 8. External Services

| Service            | Env var(s)                                      | Used by                          |
|--------------------|-------------------------------------------------|----------------------------------|
| RPC node           | `WEB3_RPC_URL`                                  | `web3.ts`, `price-oracle.ts`     |
| Resend             | `RESEND_API_KEY`, `RESEND_FROM`                 | `email.ts`                       |
| WalletConnect      | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`          | `wallet.ts`                      |
| Coinbase Onramp    | `COINBASE_ONRAMP_PROJECT_ID`, `COINBASE_ONRAMP_API_KEY` | `onramp.ts`            |
| Stripe Onramp      | `STRIPE_SECRET_KEY`, `STRIPE_ONRAMP_API_BASE`   | `onramp.ts`                      |

When a service key is missing, the related feature is skipped or logs instead
of throwing (e.g. `sendEmail` logs `[email:disabled]`), keeping the app runnable
in a zero-config environment.

---

## 9. Security Model

- **Confidentiality** — passwords never leave the server; secrets are env-only
  and `.env*` is git-ignored.
- **Integrity** — scrypt + constant-time compare; sessions are unguessable
  256-bit tokens with server-side expiry.
- **Authorization** — every protected API route calls `assertUser` /
  `assertAdmin`; server components re-check the cookie on each request.
- **Input validation** — amounts must be finite/positive; addresses and tx
  hashes are regex-validated; admin actions are idempotent.
- **Least privilege** — the admin DataProvider is read-only by design; the
  only write path is approve/reject.

---

## 10. Scaling & Productionization

The current architecture is intentionally minimal. Before production:

1. **Persistence** — replace `src/lib/store.ts` with a real database
   (see `.kilocode/recipes/add-database.md`). Keep the `db` method signatures.
2. **Concurrency** — the JSON store's per-call writes are not safe under
   multiple processes; a DB removes this risk.
3. **Balance consistency** — balances are mutated inside `updateTransaction`;
   move to atomic DB transactions.
4. **Rate limiting / anti-abuse** — add to auth and on-ramp endpoints.
5. **On-chain verification** — deposits currently trust the submitted `txHash`;
   verify it against the destination address and chain in a worker.
6. **Secrets** — provision via your host's secret manager, not `.env.local`.
