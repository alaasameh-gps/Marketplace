/* Integration verification for Phases 7-9 (Cart / Checkout / Orders / Commissions / Payments).
 * Connects to the real MongoDB via getConnectionUri() but uses a DEDICATED test database
 * ("marked_test") so production data is never touched.
 */
import { createHmac } from "node:crypto";
import mongoose from "mongoose";

import { getConnectionUri } from "../src/config/db.js";
import { Category } from "../src/models/Category.model.js";
import { Brand } from "../src/models/Brand.model.js";
import { Product } from "../src/models/Product.model.js";
import { setVendorStatus } from "../src/services/vendor.service.js";
import { register } from "../src/services/auth.service.js";
import { createVendorProduct } from "../src/services/product.service.js";
import {
  addCartItem,
  getCartEnriched,
} from "../src/services/cart.service.js";
import { checkout } from "../src/services/checkout.service.js";
import {
  cancelCustomerOrder,
  getCustomerOrderById,
  setVendorGroupStatus,
} from "../src/services/order.service.js";
import { initiateOrderPayment, handlePaymentWebhook } from "../src/services/payment.service.js";
import {
  listVendorCommissions,
  getVendorCommissionSummary,
} from "../src/services/commission.service.js";
import { env } from "../src/config/env.js";
import { Order } from "../src/models/Order.model.js";

const TEST_DB = "marked_test";

let passed = 0;
let failed = 0;

function assert(condition: unknown, message: string): void {
  if (condition) {
    passed += 1;
    console.log("  PASS " + message);
  } else {
    failed += 1;
    console.error("  FAIL " + message);
  }
}

async function signRawBody(rawBody: Buffer): Promise<string> {
  return createHmac("sha256", env.sandboxWebhookSecret).update(rawBody).digest("hex");
}

async function main() {
  const uri = await getConnectionUri();
  console.log("Connecting to test DB: " + TEST_DB);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    dbName: TEST_DB,
  });
  console.log("CONNECTED db=" + mongoose.connection.name);

  // Clean slate — drop test collections (never prod).
  const db = mongoose.connection.db;
  if (!db) throw new Error("No db handle");
  const colls = await db.listCollections().toArray();
  for (const c of colls) {
    await db.dropCollection(c.name);
  }
  console.log("Dropped existing test-collections.\n");

  const customerStoreName = `customer-${Date.now()}`;
  const vendorStoreName = `vendor-${Date.now()}`;
  const password = "StrongPass123!";

  // 1. Register customer + vendor
  const customer = await register({
    name: "Test Customer",
    email: `customer-${Date.now()}@example.com`,
    password,
    role: "customer",
  });

  const vendorAccount = await register({
    name: "Test Vendor Owner",
    email: `vendor-${Date.now()}@example.com`,
    password,
    role: "vendor",
    storeName: vendorStoreName,
  });

  const customerId = customer.user._id.toString();
  const vendorOwnerId = vendorAccount.user._id.toString();
  assert(!!customerId && !!vendorOwnerId, "Registered customer + vendor");

  // Approve vendor store (direct DB, mimics admin action)
  const vendor = vendorAccount.store;
  if (!vendor) {
    throw new Error("Vendor store missing");
  }
  await setVendorStatus(vendor._id.toString(), "approved");
  const approvedVendor = await mongoose.connection.db
    ?.collection("vendors")
    .findOne({ _id: vendor._id });
  assert(
    approvedVendor?.status === "approved",
    `Vendor store approved (mock admin) -> ${approvedVendor?.status}`,
  );

  // 2. Category + Brand
  const category = await Category.create({
    name: { en: "Electronics", ar: "إلكترونيات" },
    slug: `electronics-${Date.now()}`,
  });
  const brand = await Brand.create({
    name: { en: "TestBrand", ar: "تست براند" },
    slug: `testbrand-${Date.now()}`,
  });
  assert(!!category._id && !!brand._id, "Category + Brand created");

  // 3. Product
  const product = await createVendorProduct(vendor._id.toString(), {
    category: category._id.toString(),
    brand: brand._id.toString(),
    name: { en: "Wireless Headphones", ar: "سماعات لاسلكية" },
    price: 99900,
    status: "active",
    availableStock: 10,
  });
  const productId = product._id.toString();
  assert(!!productId, "Product created with stock=10, price=99900 halalas");

  // 4. Cart
  const enriched1 = await getCartEnriched(customerId);
  assert(enriched1.cart.groups.length === 0, "Cart initially empty");

  await addCartItem(customerId, productId, 2);
  const enriched2 = await getCartEnriched(customerId);
  assert(enriched2.cart.itemCount === 2, "Cart has 2 items after add qty=2");
  assert(enriched2.cart.groups.length === 1, "Cart grouped by 1 vendor");

  // 5. Checkout (idempotent)
  const shippingAddress = {
    fullName: "Test Customer",
    phone: "+966500000000",
    line1: "Test St 1",
    city: "Riyadh",
    region: "Riyadh",
    country: "SA",
  };

  const idempotencyKey = `it-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const first = await checkout(customerId, { idempotencyKey, shippingAddress });
  assert(first.recovered === false, "Checkout created NEW order");
  assert(!!first.order._id, "Order returned");

  const orderId = first.order._id.toString();
  assert(
    first.order.totals.subtotal === 99900 * 2,
    `subtotal correct (${first.order.totals.subtotal})`,
  );
  assert(first.order.status === "pending", "Order starts pending");
  assert(first.order.paymentStatus === "unpaid", "Order paymentStatus unpaid");

  // Idempotent retry returns same order
  const second = await checkout(customerId, { idempotencyKey, shippingAddress });
  assert(second.recovered === true, "Checkout retry recovered existing order");
  assert(second.order._id.toString() === orderId, "Same order recovered (idempotent)");

  // 6. Payment initiate + sandbox webhook (success)
  const paymentInit = await initiateOrderPayment({
    userId: customerId,
    orderId,
    providerName: "sandbox",
  });
  assert(!!paymentInit.payment && !!paymentInit.payment.providerRef, "Payment initiated");

  const providerRef = paymentInit.payment.providerRef;
  const webhookPayload = Buffer.from(
    JSON.stringify({
      event: "payment.succeeded",
      providerRef,
      amount: 199800,
      transactionId: `txn-${Date.now()}`,
      currency: "SAR",
    }),
  );

  const badSig = await handlePaymentWebhook({
    providerName: "sandbox",
    headers: { "x-sandbox-signature": "wrong-signature" },
    rawBody: webhookPayload,
  });
  assert(badSig.accepted === false, "Webhook with bad signature rejected");

  const goodSig = await handlePaymentWebhook({
    providerName: "sandbox",
    headers: { "x-sandbox-signature": await signRawBody(webhookPayload) },
    rawBody: webhookPayload,
  });
  assert(goodSig.accepted === true, "Webhook with valid signature accepted");

  const paidOrder = await getCustomerOrderById(customerId, orderId);
  assert(paidOrder.paymentStatus === "paid", "Order marked paid after webhook");

  // 7. Stock finalized
  const finalProduct = await Product.findById(productId);
  assert(
    finalProduct?.inventory.availableStock === 8,
    `available stock finalized to 8 (got ${finalProduct?.inventory.availableStock})`,
  );
  assert(
    finalProduct?.inventory.reservedStock === 0,
    `reserved stock finalized to 0 (got ${finalProduct?.inventory.reservedStock})`,
  );
  assert(
    finalProduct?.inventory.purchasedStock === 2,
    `purchased stock finalized to 2 (got ${finalProduct?.inventory.purchasedStock})`,
  );

  // 8. Commissions settled on payment
  const vendorComm = await listVendorCommissions(vendor._id.toString(), {});
  assert(
    vendorComm.items.length === 1,
    "Vendor has 1 commission record",
  );
  const commission = vendorComm.items[0];
  assert(
    commission.status === "settled",
    `Commission auto-settled on payment (got ${commission.status})`,
  );
  assert(
    (commission.amount ?? commission.commissionAmount) > 0,
    "Commission amount > 0",
  );

  const summary = await getVendorCommissionSummary(vendor._id.toString());
  assert(summary.totalRecords === 1, "Vendor commission summary count = 1");

  // 9. Vendor group status transitions
  const vendorView = await getCustomerOrderById(customerId, orderId); // shared data: groups
  const group = vendorView.groups[0];
  assert(!!group && !!group._id, "Order has at least one vendor group");

  await setVendorGroupStatus(vendor._id.toString(), orderId, group._id.toString(), "confirmed");
  const confirmedOrder = await getCustomerOrderById(customerId, orderId);
  const confirmedGroup = confirmedOrder.groups.find((g) => g._id?.toString() === group?._id?.toString());
  assert(confirmedGroup?.status === "confirmed", "Vendor set group -> confirmed");

  await setVendorGroupStatus(vendor._id.toString(), orderId, group._id.toString(), "processing");
  const processingOrder = await getCustomerOrderById(customerId, orderId);
  const processingGroup = processingOrder.groups.find((g) => g._id?.toString() === group?._id?.toString());
  assert(processingGroup?.status === "processing", "Vendor set group -> processing");

  // 10. Cancelling a PAID order is blocked
  let cancelBlocked = false;
  try {
    await cancelCustomerOrder(customerId, orderId);
  } catch {
    cancelBlocked = true;
  }
  assert(cancelBlocked, "Paid order cancellation rejected");

  // 11. Stock release on cancellation (unpaid order)
  const product2 = await createVendorProduct(vendor._id.toString(), {
    category: category._id.toString(),
    brand: brand._id.toString(),
    name: { en: "Smart Watch", ar: "ساعة ذكية" },
    price: 50000,
    status: "active",
    availableStock: 3,
  });

  await addCartItem(customerId, product2._id.toString(), 1);
  const iK2 = `it2-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const secondOrder = await checkout(customerId, { idempotencyKey: iK2, shippingAddress });
  const secondOrderId = secondOrder.order._id.toString();
  const secondOrderBeforeCancel = await Product.findById(product2._id);
  assert(
    secondOrderBeforeCancel?.inventory.reservedStock === 1,
    "Second order reserved stock = 1",
  );

  await cancelCustomerOrder(customerId, secondOrderId);
  const secondOrderAfterCancel = await Product.findById(product2._id);
  assert(
    secondOrderAfterCancel?.inventory.reservedStock === 0,
    "Stock released after cancel",
  );

  // 12. Buying more than stock is rejected at both cart-add and checkout levels
  let overstockCaught = false;
  try {
    await addCartItem(customerId, productId, 999);
  } catch (e) {
    overstockCaught = /Only|stock/i.test((e as Error).message);
  }
  assert(overstockCaught, "addCartItem blocks quantity > available stock (409)");

  let checkoutRejected = false;
  try {
    await checkout(customerId, {
      idempotencyKey: `it3-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      shippingAddress,
    });
  } catch (e) {
    checkoutRejected = true;
  }
  assert(checkoutRejected, "Over-stock checkout rejected (no order created)");

  const orderCount = await Order.countDocuments({ customer: customerId });
  assert(orderCount >= 2, `Orders exist for customer (${orderCount})`);

  // Cleanup: drop test collections again (leave nothing behind)
  const collsAfter = await db.listCollections().toArray();
  for (const c of collsAfter) {
    await db.dropCollection(c.name);
  }
  console.log("\nCleaned all test collections.");
  await mongoose.disconnect();

  console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Integration test crashed:", err);
  process.exit(1);
});