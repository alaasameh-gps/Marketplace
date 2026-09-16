# Marketplace — System Architecture

> Phase 1 · Design documentation (no implementation)
> Scope: system-wide architecture, frontend & backend design, roles, security,
> multi-vendor ordering, inventory, commission, payment boundaries, API surface.

---

## 1. System Architecture

Marketplace is a multi-vendor e-commerce marketplace. It is split into three independent
deployable parts that communicate over HTTP.

```
┌──────────────────────┐
│     FRONTEND         │  Next.js (App Router) + TypeScript + Tailwind CSS
│  Customer Storefront │  Vendor Dashboard · Admin Dashboard · i18n (ar/en)
│  Vendor / Admin UI   │  Renders data via the REST API. Never touches MongoDB.
└──────────┬───────────┘
           │ HTTPS — JSON REST
           ▼
┌──────────────────────┐
│     BACKEND          │  Node.js + Express + TypeScript (REST API)
│  Routes → Middleware │  Business logic lives in services. Thin controllers.
│  → Controllers       │  Auth, authorization, validation, inventory, commission.
│  → Services          │
└──────────┬───────────┘
           │ Mongoose ODM
           ▼
┌──────────────────────┐
│      DATABASE        │  MongoDB (MongoDB Atlas in production)
└──────────────────────┘
```

**Layer responsibilities**

| Layer | Responsibility |
|---|---|
| Frontend | UI, user interaction, client-side state, API calls, localization, RTL/LTR |
| REST API | Contract between clients and system; versioned, stateless |
| Backend | Auth, authorization, business rules, validation, orchestration, commission/inventory logic, payment orchestration, webhook handling |
| Database | Persistent storage, integrity via indexes/constraints, atomic stock operations |

**Non-goals of this doc**

* No secrets, credentials, or deployment keys.
* No implementation of the flows described — it is used as the blueprint for Phases 2–11.

---

## 2. Frontend Architecture

### 2.1 Framework and structure

* Next.js App Router, TypeScript, Tailwind CSS.
* Three top-level areas, isolated with route groups and role-guarded layouts.
* All merchant/customer pages are server-rendered where possible; heavy interactive
  areas (cart, checkout, dashboards) use client components.

```
frontend/
├── app/
│   ├── [locale]/                     ← locale segment (introduced from Phase 6, see §14)
│   │   ├── (marketing)/              ← Customer storefront (no auth required)
│   │   │   ├── page.tsx              ← Home: featured products, categories, brands
│   │   │   ├── products/page.tsx     ← Listing: search / filter / sort / pagination
│   │   │   ├── products/[slug]/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── categories/[slug]/page.tsx
│   │   │   ├── brands/page.tsx
│   │   │   ├── brands/[slug]/page.tsx
│   │   │   └── vendors/[slug]/page.tsx
│   │   ├── (auth)/                   ← Login / registration (no auth required, guest only)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── account/                  ← Customer: authenticated, self-owned only
│   │   │   ├── profile/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── orders/[id]/page.tsx
│   │   ├── vendor/                   ← Vendor dashboard (vendor role only)
│   │   │   ├── layout.tsx            ← role guard + sidebar
│   │   │   ├── page.tsx              ← overview / sales
│   │   │   ├── products/…
│   │   │   ├── inventory/…
│   │   │   ├── orders/…
│   │   │   └── commissions/…
│   │   └── admin/                    ← Admin dashboard (admin role only)
│   │       ├── layout.tsx            ← role guard + sidebar
│   │       ├── page.tsx              ← marketplace overview
│   │       ├── users/ vendors/ products/ categories/ brands/
│   │       ├── orders/ commissions/
│   │       └── settings/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                           ← reusable primitives (button, card, input…)
│   ├── storefront/                   ← home/catalog components
│   ├── account/
│   ├── vendor/
│   ├── admin/
│   └── shared/                       ← navbar, footer, locale-switch, cart-drawer
├── services/                         ← API client functions (typed, one per domain)
├── hooks/                            ← custom hooks (useCart, useAuth, useDebounce…)
├── lib/                              ← api-client config, i18n config, format utils
└── types/                            ← TypeScript types mirroring the API
```

### 2.2 State management

* **Server state (data from the API):** TanStack Query (React Query) — introduces
  caching, background refetch, loading/error states, and retry. Used from Phase 6.
* **Client state:**
  * *Auth session* — small React Context fed by the auth API; persisted via
    the refresh-token cookie (the access token is kept in memory, see §5).
  * *Cart* — server-backed cart (single source of truth); the cart drawer keeps a
    lightweight local mirror that re-syncs from the server.
* Forms handled with `react-hook-form` (+ Zod schema validation mirrored from backend).

### 2.3 API communication

* Single typed API client in `lib/` (fetch wrapper): attaches `Authorization`,
  handles `401` → refresh flow, decodes the standard envelope
  `{ success, data }` / `{ success:false, message, code }`.
* Domain functions in `services/` (e.g. `productsService.list(query)`).
* `NEXT_PUBLIC_API_URL` env for the base URL. No keys/passwords in the client.

### 2.4 Authentication state & route guards

* Initial session check via `GET /api/v1/auth/me` on app boot.
* Role-based access enforced **on the client** (UX) and **on the server** (security).
  Middleware redirects unauthenticated/unauthorized users; every API call is
  independently authorized server-side.
* Vendor dashboard always renders only data the API returns for the authenticated vendor.

---

## 3. Backend Architecture

Layered architecture: **routes → middleware → controllers → services → models**.

```
backend/
├── src/
│   ├── config/          env.ts · db.ts · (later) settings.ts
│   ├── routes/
│   │   ├── index.ts                     mounts top-level /api
│   │   ├── health.routes.ts             keeps /api/health (infra liveness)
│   │   └── v1/                          all business endpoints
│   │       ├── index.ts                 mounts everything under /api/v1
│   │       ├── auth.routes.ts   user.routes.ts   vendor.routes.ts
│   │       ├── product.routes.ts category.routes.ts brand.routes.ts
│   │       ├── cart.routes.ts    checkout.routes.ts  order.routes.ts
│   │       ├── commission.routes.ts payment.routes.ts
│   │       └── admin.routes.ts
│   ├── controllers/     thin HTTP layer: parse/validate input, call service, map response
│   ├── services/        business logic only (no req/res): auth, cart, order, inventory,
│   │                    commission, payment orchestration
│   ├── models/          Mongoose schemas (User, Vendor, Product, Category, Brand,
│   │                    Cart, Order, Commission, Payment, SiteSettings)
│   ├── middleware/      requireAuth · requireRole · requireOwnership · validate …
│   ├── validations/     Zod schemas for every endpoint input
│   ├── utils/           ApiError · asyncHandler · money/pagination helpers …
│   ├── types/           shared TS types / DTOs
│   ├── app.ts           Express app assembly (middleware order matters, see §13)
│   └── server.ts        bootstrap: env → connect DB → listen (Phase 0)
├── tsconfig.json
├── .env / .env.example
└── package.json
```

**Separation rules**

* Controllers must stay thin — no business logic, no DB access.
* Services are the single place for business logic and DB operations.
* Validations are declarative (Zod) and run in middleware before controllers.
* Models only define schema/constraints to avoid logic bleeding into the data layer.

---

## 4. Roles

| Role | Storefront | Account (self) | Vendor tools | Admin tools |
|---|---|---|---|---|
| **Guest** (no token) | browse, search, view | — | — | — |
| **Customer** | browse + cart + checkout | profile, own orders | — | — |
| **Vendor** | as customer | same | own store, own products, own inventory, own orders/sales/commissions | — |
| **Admin** | as customer | same | — | everything, platform-level |

Role model:
* Stored on `User.role`.
* Admin is never created via public registration — only via a seed script
  (`ADMIN_INITIAL_EMAIL` / `ADMIN_INITIAL_PASSWORD` env) or an existing admin (Phase 3).
* A `Vendor` document (store) is owned by exactly one `User` with `role: 'vendor'`.

---

## 5. Authentication Architecture (design only)

* **Registration** — customers and vendors register publicly. Vendor records start
  in `pending` status until an admin approves (Phase 4).
* **Login** — email + password; server-side constant-time comparison after bcrypt.
* **Password hashing** — `bcrypt` (cost ≈ 10–12). Plain text is never stored or logged.
* **Tokens**
  * *Access token* — JWT, short-lived (15 min), signed with `JWT_SECRET`,
    sent by the client as `Authorization: Bearer <token>`.
  * *Refresh token* — JWT, long-lived (30 days), stored in an
    **httpOnly, Secure, SameSite cookie** — immune to XSS token theft; replaced on
    every refresh (rotation) with reuse-detection. Also persisted for revocation.
  * Strategy: `POST /auth/refresh` rotates the cookie; `POST /auth/logout` revokes it.
* **Protected routes** — `requireAuth` middleware verifies the access token and loads
  the user; `requireRole('admin' | 'vendor')` on top when needed.
* **Admin bootstrap** — seed script guarded by env vars; never a public endpoint.

> **REQUIRES USER APPROVAL** — token storage (refresh in httpOnly cookie vs all-tokens
> in memory/localStorage). Recommendation: refresh token in httpOnly cookie (safer
> against XSS; requires CORS + cookie config). Ratified during Phase 3.

---

## 6. Authorization

* **Role-based** — `requireRole(...)` gates every restricted endpoint.
* **Customer ownership** — every customer resource query filters by
  `userId: req.user.id`. A customer can never request another customer's cart/orders
  (ownership enforced server-side; client-supplied IDs are never trusted).
* **Vendor ownership** — a vendor may only read/modify:
  * their own `Vendor` store document,
  * products where `product.vendorId === req.user.vendor.id`.
  Ownership middleware resolves the resource and rejects cross-vendor access with `403`.
* **Admin** — bypasses ownership filters in admin endpoints, which are themselves
  role-locked.
* All restrictions are enforced server-side; the frontend only mirrors them in the UI.

---

## 7. Multi-Vendor Architecture

One customer checkout can contain products from many vendors, but the customer sees
**one order**.

```
Customer Order (one document)
├── OrderGroup  → Vendor A
│     ├── OrderItem → Product A1 (qty, unitPrice snapshot, subtotal)
│     └── OrderItem → Product A2
│     · groupSubtotal, commissionRate₀, commissionAmount₀, vendorEarnings₀
│     · groupStatus (per-vendor fulfillment: pending → confirmed → shipped → …)
├── OrderGroup  → Vendor B
│     └── OrderItem → Product B1
└── totals { subtotal, shipping, tax, total }
```

**Design decision — embedded groups (chosen):**

* `Order.groups[]` embeds per-vendor `OrderGroup` documents inline (schema defined
  as subdocuments, not a separate collection).
* Rationale: an order is naturally small and bounded; the customer's full order is one
  read; per-vendor accesses are indexed on `groups.vendorId`; no joins needed.
* *Alternative considered:* separate `OrderGroup` collection keyed to an order. Rejected
  for now — extra round-trips and consistency handling without a real win at this size.
  Revisit only if a single order ever approaches thousands of items.
* Vendor status, fulfillment timeline, and vendor commission snapshot live **inside its
  group**, so each vendor manages only its own slice while the customer's order stays whole.
* Vendor queries ("all my order items") use indexes on `groups.vendorId` + `groups.status`.

---

## 8. Inventory Architecture

### 8.1 Stock model

Each product carries a stock breakdown:

```
availableStock   → sellable now
reservedStock    → held for pending/confirmed orders (checked-out, not yet paid/finalized)
purchasedStock   → stock linked to successfully paid orders
```

Stock totals: `totalStock = available + reserved + purchased`.

### 8.2 Lifecycle

| Event | available | reserved | purchased |
|---|---|---|---|
| Checkout / order created (pending) | −qty | +qty | — |
| Payment success (finalize) | (unchanged) | −qty | +qty |
| Order cancelled before payment | +qty | −qty | — |
| Paid order cancelled/refunded | +qty | — | −qty |

### 8.3 Concurrency & race conditions

* Product stock updates are **atomic conditional writes**:
  `findOneAndUpdate({ _id, 'inventory.availableStock': { $gte: qty } }, { $inc: … })`.
  Only one concurrent checkout wins the decrement; losers retry with fresher data or fail.
* Checkout re-validates stock inside the same MongoDB transaction that creates the
  order and reserves stock, so an order is never created without a successful reserve.
* Idempotency: checkout is protected by an idempotency key so retries do not
  double-reserve.

---

## 9. Commission Architecture

* Commission applies to each **vendor group** of an order (each vendor may get a rate).
* `SiteSettings.commissionRate` holds the current global rate (default e.g. 10%).
* At order-fix time the system **snapshots** per group:
  `commissionRate₀`, `commissionAmount₀`, `vendorEarnings₀` — historical records are
  immutable and never recalculated from a later global rate.

```
OrderGroup (Vendor A)  subtotal = 300
    commissionRate₀ = 10%   → commission 30  ·  vendor earns 270
OrderGroup (Vendor B)  subtotal = 200
    commissionRate₀ = 10%   → commission 20  ·  vendor earns 180
```

* A separate **Commission ledger collection** (vendor, order/group ref, rate₀, amount₀,
  earnings, status `pending → settled`, settlementRef) powers reporting and future
  payouts, while groups keep the snapshot for integrity.
* Money is tracked to the smallest unit (SAR = integer halalas ± 0) to avoid float
  rounding errors; rounding converges exactly to the order total.

---

## 10. Payment Architecture (boundaries only)

> Payment is **not implemented** until Phase 9. This section defines the seam.

* **Flow:** checkout creates a pending order → payment initiation → customer pays on
  gateway → gateway webhook → server verifies signature → idempotent update → payment
  recorded → order finalized → inventory finalized → commission finalized.
* **Trust boundary:** `payment-success` from the frontend is **never trusted**. Only a
  verified server-side webhook (signature + amount + reference match) flips a payment to
  `paid`.
* **Provider abstraction:** a `PaymentProvider` interface (initiate / verify-webhook /
  refund). Concrete implementation injected via config — enables sandbox, stubs, and
  switching providers without touching order/inventory logic.
* **Provider selection (the region):** candidates such as Moyasar, Tap, Hyperpay,
  Checkout.com — final choice is a Phase 9 decision:

> **REQUIRES USER APPROVAL** — payment provider is chosen with the user before
> implementation (Phase 9), based on: SAR support, marketplace/checkout support,
> webhooks, refunds, vendor payout capabilities, fees, and sandbox availability.

* `Payment` model records: intent id, amount/currency, status
  (`initiated → pending → paid/failed/cancelled/refunded`), references, webhook idempotency.
* Raw card data (PAN/CVV) is never stored or transmitted through our servers.

---

## 11. API Structure

Versioned REST API under `/api/v1`. Base response envelope:

```jsonc
// success
{ "success": true, "data": { … }, "pagination": { "page": 1, "limit": 20, "total": 134 } }
// error (see Phase 0 middleware)
{ "success": false, "message": "…", "code": "ORDER_NOT_FOUND" }
```

`GET /api/health` remains as infrastructure liveness (load balancer); all business
endpoints live under `/api/v1`.

### 11.1 Auth
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register` | guest | register customer or vendor |
| POST | `/api/v1/auth/login` | guest | authenticate, set refresh cookie, return access token |
| POST | `/api/v1/auth/refresh` | cookie | rotate refresh token |
| POST | `/api/v1/auth/logout` | auth | revoke refresh token |
| GET | `/api/v1/auth/me` | auth | current user + role + vendor info |
| PATCH | `/api/v1/auth/change-password` | auth | password change |

### 11.2 Users (self)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET/PATCH | `/api/v1/users/me` | auth | read/update own profile |
| GET | `/api/v1/users/me/orders` | customer | own orders (legacy alias of orders endpoint) |

### 11.3 Vendors
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/vendors` | guest | public vendor list (storefront) |
| GET | `/api/v1/vendors/:slug` | guest | vendor storefront profile |
| GET | `/api/v1/vendors/:slug/products` | guest | vendor's active products |
| GET/PATCH | `/api/v1/vendors/me` | vendor | own store profile |
| GET | `/api/v1/vendors/me/products` | vendor | own products (with inventory) |
| GET | `/api/v1/vendors/me/orders` | vendor | own order groups |
| GET | `/api/v1/vendors/me/orders/:id` | vendor | own group detail |
| PATCH | `/api/v1/vendors/me/orders/:id/status` | vendor | update own group status |
| GET | `/api/v1/vendors/me/commissions` | vendor | own commission ledger + earnings summary |

### 11.4 Categories / Brands
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/categories` | guest | category tree |
| GET | `/api/v1/brands` | guest | brand list |
| POST/PATCH/DELETE | `/api/v1/admin/categories[/:id]` | admin | manage categories |
| POST/PATCH/DELETE | `/api/v1/admin/brands[/:id]` | admin | manage brands |

### 11.5 Products
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/products` | guest | listing: q(search), category, brand, minPrice/maxPrice, sort, page |
| GET | `/api/v1/products/:slug` | guest | product detail |
| POST | `/api/v1/vendors/me/products` | vendor | create product (own store) |
| PATCH/DELETE | `/api/v1/vendors/me/products/:id` | vendor | update/delete own product |
| GET/PATCH | `/api/v1/admin/products[/:id]` | admin | moderate/manage products |

### 11.6 Cart
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/cart` | customer | read cart (multi-vendor) |
| POST | `/api/v1/cart/items` | customer | add item |
| PATCH | `/api/v1/cart/items/:itemId` | customer | change quantity |
| DELETE | `/api/v1/cart/items/:itemId` | customer | remove item |
| DELETE | `/api/v1/cart` | customer | clear cart |

### 11.7 Checkout / Orders
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/checkout` | customer | validate cart+address+stock → reserve → create order groups → idempotent |
| GET | `/api/v1/orders` | customer | own orders (page) |
| GET | `/api/v1/orders/:id` | customer/admin | order detail (scoped per role) |
| PATCH | `/api/v1/orders/:id/cancel` | customer/admin | cancel (before shipment) |
| GET | `/api/v1/admin/orders[/:id]` | admin | all orders / detail |
| PATCH | `/api/v1/admin/orders/:id/status` | admin | adjust status |

### 11.8 Commissions
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/commissions` | admin | platform commission ledger |
| GET | `/api/v1/admin/commissions/summary` | admin | platform earnings aggregates |

### 11.9 Payments
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/payments` | customer | initiate payment for an order |
| POST | `/api/v1/payments/webhooks/:provider` | gateway | verified webhooks (idempotent) |
| GET | `/api/v1/admin/payments` | admin | payment records |

### 11.10 Admin / Settings
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/users[/:id]` | admin | user management |
| PATCH | `/api/v1/admin/users/:id/status` | admin | activate/suspend user |
| GET | `/api/v1/admin/vendors[/:id]` | admin | vendor management |
| PATCH | `/api/v1/admin/vendors/:id/status` | admin | approve/reject/suspend vendor |
| GET/PATCH | `/api/v1/admin/settings` | admin | platform settings incl. commission rate |

---

## 12. Folder Architecture

### 12.1 Repository layout

```
MARKED-Marketplace/
├── README.md
├── .gitignore
├── docs/
│   └── architecture.md      ← this document
├── backend/
│   ├── src/…                (see §3)
│   ├── .env / .env.example
│   ├── package.json / tsconfig.json
└── frontend/
    ├── app/ components/ hooks/ lib/ services/ types/   (see §2)
    ├── package.json / next.config.ts / tailwind / …
```

### 12.2 Conventions
* Backend: `routes/v1/*.routes.ts`, `controllers/*.controller.ts`,
  `services/*.service.ts`, `models/*.model.ts`, `validations/*.validation.ts`.
* Files named by domain (not by HTTP verb) so each domain grows in one place.
* Frontend keeps domain folders mirroring API domains.

---

## 13. Request Lifecycle

```
Browser
  │  HTTPS
  ▼
Route        matches /api/v1/...; mounts the correct router + version
  ▼
Middleware   (order matters) CORS → body parse → request-id/logging →
             rate-limit (auth) → validate (Zod) → requireAuth → requireRole/ownership
  ▼
Controller   thin: shapes input, calls exactly one service, maps result to response
  ▼
Service      business logic; uses models, transactions, inventory/commission rules
  ▼
Model        Mongoose schema/validation, query building, atomic updates
  ▼
Database     MongoDB
  ▲
  │ errors bubble back
  │             └─▶ errorHandler middleware → consistent JSON error (+ logs)
  ▼
Response     { success, data } or { success:false, message, code }
```

Middleware ordering is chosen so that invalid/unauthenticated requests fail before
any business code runs.

---

## 14. Architecture Decisions

| # | Decision | Rationale | Alternative considered | Status |
|---|---|---|---|---|
| D1 | Separate Express backend (not Next.js API routes) | Independent scaling, clear API ownership, matches stated stack | Next.js route handlers | **Agreed** |
| D2 | REST API versioned under `/api/v1` | Backward-compatible evolution | no versioning | **Agreed** |
| D3 | Layered backend (route→middleware→controller→service→model) | Testable, thin controllers, single home for business rules | logic-in-controllers | **Agreed** |
| D4 | Multi-vendor order via embedded `Order.groups[]` | One read for the customer's full order; indexed per-vendor queries | separate OrderGroup collection | **Agreed** |
| D5 | Inventory as available/reserved/purchased with atomic conditional `$inc` | Prevents overselling under concurrency; matches checkout/payment lifecycle | naive stock−qty | **Agreed** |
| D6 | Commission snapshot inside order group + separate ledger | Historical financial integrity (rate₀, amount₀) + reporting/settlement | recompute from live rate | **Agreed** |
| D7 | Money stored as integer minor units (halalas), currency field | Exact arithmetic, no float drift | JS floats | **Agreed** |
| D8 | Access (short) + refresh (httpOnly cookie, rotated) tokens | XSS-resilient session; revocation support | single long-lived JWT in localStorage | **Agreed — token storage to confirm in Phase 3 (A2)** |
| D9 | Bilingual content in DB fields (en/ar) + error `code`s for frontend i18n | Backend stays language-neutral; frontend owns display language | translated DB for everything | **Agreed** |
| D10 | Locale segment `[locale]` introduced from Phase 6 | Avoids URL rework later; enables RTL/LTR + `next-intl` cleanly | retrofitting at Phase 10 | **Agreed** |
| D11 | Admin created only via seed script (env-guarded) | No public privilege escalation | public admin signup | **Agreed** |
| D12 | `GET /api/health` stays unversioned (infra liveness); business APIs under v1 | Load-balancer probes don't belong to the versioned surface | move health into v1 | **Agreed** |
| D13 | Payment behind `PaymentProvider` interface; frontend success never trusted | Sandbox/stub-friendly; idempotent webhook-verified flows | hard-coded provider in services | **Agreed (provider TBD Phase 9)** |

**Open approval items (currently pending user decision):**

> **A1 — Payment provider (Phase 9).** Must support the region + local currency, webhooks,
> refunds, and reasonable marketplace/vendor payout options. Candidates to evaluate:
> Moyasar, Tap, Hyperpay, Checkout.com. No provider is locked before approval.

> **A2 — Auth token storage (Phase 3).** Recommended: access token in memory +
> refresh token in httpOnly Secure SameSite cookie with rotation. Confirm before
> Phase 3 implements the auth flow.

### Risks & notes

* CORS is currently permissive (`cors()` with configurable origin from env) — it will
  be locked to the configured frontend origin during hardening (Phase 11).
* Rate limiting will be added on auth/checkout endpoints (Phase 3/11).
* No secrets, real credentials, or provider keys appear anywhere in this doc.