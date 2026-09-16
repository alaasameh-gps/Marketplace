/* HTTP smoke test — boots the full Express app (middleware hardening, auth rate limiting,
 * all v1 routes) against the DEDICATED test database and exercises real HTTP endpoints.
 * Run: npx tsx scripts/smoke-http.mts
 */
import { createServer } from "node:http";

const { getConnectionUri } = await import("../src/config/db.js");

import mongoose from "mongoose";

let passed = 0;
let failed = 0;
function assert(c: unknown, m: string): void {
  if (c) { passed += 1; console.log("  PASS " + m); }
  else { failed += 1; console.error("  FAIL " + m); }
}

async function main() {
  const resolved = await getConnectionUri();
  await mongoose.connect(resolved, { serverSelectionTimeoutMS: 8000, dbName: "marked_test" });

  const { default: app } = await import("../src/app.js");
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as { port: number }).port;
  const base = `http://127.0.0.1:${port}/api/v1`;
  const url = (p: string) => base + p;

  // health
  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert(health.status === 200, `health returns 200 (${health.status})`);

  // helmet: security headers present
  assert(
    (health.headers.get("content-security-policy") ?? "").length > 0,
    "helmet CSP header present",
  );
  assert(health.headers.get("x-content-type-options") === "nosniff", "helmet nosniff present");

  // rate limited auth: register works
  const email = `http-${Date.now()}@example.com`;
  const reg = await fetch(url("/auth/register"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "HTTP Tester", email, password: "StrongPass123!", role: "customer" }),
  });
  assert(reg.status === 201 || reg.status === 200 || reg.status === 409, `register works (${reg.status})`);

  // public catalog
  const cats = await fetch(url("/categories"));
  assert(cats.status === 200, `public categories 200 (${cats.status})`);
  const brands = await fetch(url("/brands"));
  assert(brands.status === 200, `public brands 200 (${brands.status})`);
  const prods = await fetch(url("/products"));
  assert(prods.status === 200, `public products 200 (${prods.status})`);
  const vendors = await fetch(url("/vendors"));
  assert(vendors.status === 200, `public vendors 200 (${vendors.status})`);

  // auth-protected: unauth
  const meUnauth = await fetch(url("/auth/me"));
  assert(meUnauth.status === 401, `auth me unauth -> 401 (${meUnauth.status})`);

  const cartUnauth = await fetch(url("/cart"));
  assert(cartUnauth.status === 401, `cart unauth -> 401 (${cartUnauth.status})`);

  const ordersUnauth = await fetch(url("/orders"));
  assert(ordersUnauth.status === 401, `orders unauth -> 401 (${ordersUnauth.status})`);

  // login + authed /auth/me
  const login = await fetch(url("/auth/login"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "StrongPass123!" }),
  });
  const loginJson = (await login.json()) as {
    success: boolean;
    data?: { accessToken: string; user?: { role: string } };
  };
  assert(login.status === 200 && loginJson.success, `login 200 (${login.status})`);
  const token = loginJson.data?.accessToken ?? "";

  const me = await fetch(url("/auth/me"), { headers: { authorization: `Bearer ${token}` } });
  assert(me.status === 200, `auth me authed -> 200 (${me.status})`);

  const cart = await fetch(url("/cart"), { headers: { authorization: `Bearer ${token}` } });
  assert(cart.status === 200, `cart authed -> 200 (${cart.status})`);

  const orders = await fetch(url("/orders"), { headers: { authorization: `Bearer ${token}` } });
  assert(orders.status === 200, `orders authed -> 200 (${orders.status})`);

  // body limit: oversized JSON rejected (413/400), not 500
  const big = await fetch(url("/auth/login"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "x".repeat(100_000), password: "y" }),
  });
  assert(big.status === 413 || big.status === 400, `oversized body handled (${big.status})`);

  await mongoose.disconnect().catch(() => undefined);
  server.close();
  console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("HTTP smoke test crashed:", err);
  process.exit(1);
});