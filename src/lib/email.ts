import "server-only";
import { Resend } from "resend";
import type { IOrder } from "@/lib/models/Order";
import { formatNaira } from "@/lib/money";
import { SITE_URL } from "@/lib/seo";

/**
 * Transactional email via Resend.
 * Everything here no-ops gracefully until RESEND_API_KEY (+ EMAIL_FROM) are set,
 * so the store keeps working before email is configured.
 */

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/** Email categories, each sent from its own role mailbox. */
type Sender = "orders" | "support" | "hello" | "security" | "notifications";

const SENDER_NAMES: Record<Sender, string> = {
  orders: "Becca's Knotique Orders",
  support: "Becca's Knotique Support",
  hello: "Becca's Knotique",
  security: "Becca's Knotique Security",
  notifications: "Becca's Knotique",
};

/** The verified sending domain. Derived from EMAIL_FROM if present. */
function emailDomain(): string {
  if (process.env.EMAIL_DOMAIN) return process.env.EMAIL_DOMAIN;
  const m = process.env.EMAIL_FROM?.match(/@([^>\s]+?)>?$/);
  return m?.[1] ?? "beccasknotique.com";
}

/**
 * From-address for a category. Uses a role mailbox on the verified domain
 * (orders@, support@, security@, notifications@, hello@) so customers can tell
 * what an email is about and replies land in the right place. All addresses
 * work off the single verified domain, no per-address setup needed.
 * Set EMAIL_FROM to force one sender for everything (useful for testing before
 * the domain is verified).
 */
function fromFor(sender: Sender): string {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  return `${SENDER_NAMES[sender]} <${sender}@${emailDomain()}>`;
}

function adminAddress(): string | null {
  return (
    process.env.ORDER_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || null
  );
}

function itemsTable(order: IOrder): string {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#44403c;">
          ${i.name}${i.size ? ` · ${i.size}` : ""}${i.color ? ` · ${i.color}` : ""}
          <span style="color:#a8a29e;"> × ${i.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;color:#1c1917;white-space:nowrap;">
          ${formatNaira(i.price * i.quantity)}
        </td>
      </tr>`,
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rows}
      <tr>
        <td style="padding:12px 0 0;font-weight:600;color:#1c1917;">Total</td>
        <td style="padding:12px 0 0;text-align:right;font-weight:700;color:#1c1917;">
          ${formatNaira(order.amount)}
        </td>
      </tr>
    </table>`;
}

function shell(title: string, body: string): string {
  return `
  <div style="background:#f5f5f4;padding:32px 0;font-family:ui-sans-serif,system-ui,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
      <div style="background:#0a0a0a;padding:24px 28px;">
        <p style="margin:0;color:#fff;font-size:18px;font-weight:700;letter-spacing:0.02em;">Becca&apos;s Knotique</p>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 8px;font-size:20px;color:#1c1917;">${title}</h1>
        ${body}
      </div>
      <div style="padding:18px 28px;border-top:1px solid #f0ede9;color:#a8a29e;font-size:12px;">
        Handmade crochet, made for you. ·
        <a href="${SITE_URL}" style="color:#059669;text-decoration:none;">beccasknotique.com</a>
      </div>
    </div>
  </div>`;
}

/** Small styled helpers so the templates stay short and consistent. */
const p = (text: string): string =>
  `<p style="color:#57534e;font-size:14px;line-height:1.6;margin:0 0 12px;">${text}</p>`;

const muted = (text: string): string =>
  `<p style="color:#a8a29e;font-size:12px;line-height:1.6;margin:12px 0 0;">${text}</p>`;

const button = (href: string, label: string): string =>
  `<p style="margin:22px 0;">
     <a href="${href}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:12px;">${label}</a>
   </p>`;

/**
 * Generic sender. Returns true only when Resend is configured and the send
 * succeeded, so callers can fall back (e.g. log a link in dev). Never throws.
 */
async function sendMail(opts: {
  to: string;
  subject: string;
  title: string;
  body: string;
  sender?: Sender;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  try {
    await resend.emails.send({
      from: fromFor(opts.sender ?? "hello"),
      to: opts.to,
      subject: opts.subject,
      html: shell(opts.title, opts.body),
    });
    return true;
  } catch (error) {
    console.error(`[email] "${opts.subject}" error:`, error);
    return false;
  }
}

function orderRef(order: Pick<IOrder, "orderNumber" | "reference">): string {
  return order.orderNumber ?? order.reference;
}

/**
 * Sends a password-reset link. Returns true if an email was actually sent
 * (i.e. Resend is configured), so the caller can fall back to logging the link
 * in development.
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  link: string,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false; // not configured — caller logs the link in dev

  try {
    await resend.emails.send({
      from: fromFor("security"),
      to,
      subject: "Reset your Becca's Knotique password",
      html: shell(
        "Reset your password",
        `<p style="color:#57534e;font-size:14px;line-height:1.6;">
           Hi ${name || "there"}, we got a request to reset your password.
           Tap the button below to choose a new one. This link expires in 1 hour.
         </p>
         <p style="margin:24px 0;">
           <a href="${link}"
              style="display:inline-block;background:#059669;color:#fff;text-decoration:none;
                     font-weight:600;font-size:14px;padding:12px 22px;border-radius:12px;">
             Reset password
           </a>
         </p>
         <p style="color:#a8a29e;font-size:12px;line-height:1.6;">
           If you didn&apos;t ask for this, you can safely ignore this email and your
           password stays the same.
         </p>`,
      ),
    });
    return true;
  } catch (error) {
    console.error("[email] sendPasswordResetEmail error:", error);
    return false;
  }
}

/** Sends the customer receipt + the owner notification for a paid order. */
export async function sendOrderEmails(order: IOrder): Promise<void> {
  const resend = getResend();
  if (!resend) return; // not configured yet — skip silently

  const admin = adminAddress();
  const shipping = `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state}`;

  const tasks: Promise<unknown>[] = [];

  // Customer receipt
  tasks.push(
    resend.emails.send({
      from: fromFor("orders"),
      to: order.email,
      subject: `Your Becca's Knotique order is confirmed (${order.orderNumber ?? order.reference})`,
      html: shell(
        "Thank you for your order!",
        `<p style="color:#57534e;font-size:14px;line-height:1.6;">
           Hi ${order.customer.name}, we&apos;ve received your payment and your order is confirmed.
           We&apos;ll be in touch about delivery to <strong>${shipping}</strong>.
         </p>
         <div style="margin:20px 0;">${itemsTable(order)}</div>
         <p style="color:#a8a29e;font-size:12px;">Order number: ${order.orderNumber ?? order.reference}</p>`,
      ),
    }),
  );

  // Owner notification
  if (admin) {
    tasks.push(
      resend.emails.send({
        from: fromFor("notifications"),
        to: admin,
        subject: `New paid order — ${formatNaira(order.amount)} (${order.orderNumber ?? order.reference})`,
        html: shell(
          "New order received 🎉",
          `<p style="color:#57534e;font-size:14px;line-height:1.6;">
             <strong>${order.customer.name}</strong> just paid for an order.
           </p>
           <div style="margin:16px 0;">${itemsTable(order)}</div>
           <table style="width:100%;font-size:13px;color:#57534e;">
             <tr><td style="padding:2px 0;">Email</td><td style="text-align:right;">${order.email}</td></tr>
             <tr><td style="padding:2px 0;">Phone</td><td style="text-align:right;">${order.customer.phone}</td></tr>
             <tr><td style="padding:2px 0;">Deliver to</td><td style="text-align:right;">${shipping}</td></tr>
             ${order.shipping.note ? `<tr><td style="padding:2px 0;">Note</td><td style="text-align:right;">${order.shipping.note}</td></tr>` : ""}
           </table>`,
        ),
      }),
    );
  }

  try {
    await Promise.allSettled(tasks);
  } catch (error) {
    console.error("[email] sendOrderEmails error:", error);
  }
}

// ---------------------------------------------------------------------------
// Account & security
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(to: string, name?: string) {
  return sendMail({
    to,
    sender: "hello",
    subject: "Welcome to Becca's Knotique",
    title: `Welcome, ${name || "friend"}!`,
    body:
      p("Thanks for creating an account. You can now check out faster, track your orders, and keep a wishlist of pieces you love.") +
      p("Every item is handmade with care, and many are made to order just for you.") +
      button(`${SITE_URL}/products`, "Start shopping"),
  });
}

export async function sendPasswordChangedEmail(to: string, name?: string) {
  return sendMail({
    to,
    sender: "security",
    subject: "Your password was changed",
    title: "Your password was changed",
    body:
      p(`Hi ${name || "there"}, this is a confirmation that your Becca's Knotique password was just changed.`) +
      muted("If this wasn't you, please reset your password right away and contact us at beccasknotique@gmail.com."),
  });
}

export async function sendAccountDeletedEmail(to: string, name?: string) {
  return sendMail({
    to,
    sender: "security",
    subject: "Your account has been deleted",
    title: "Your account has been deleted",
    body:
      p(`Hi ${name || "there"}, your Becca's Knotique account has been closed and your profile removed, as you requested.`) +
      p("You're always welcome back. Thank you for shopping with us.") +
      muted("If you didn't request this, contact us at beccasknotique@gmail.com."),
  });
}

// ---------------------------------------------------------------------------
// Order fulfillment updates
// ---------------------------------------------------------------------------

type FulfillmentStage = "processing" | "shipped" | "delivered";

export async function sendOrderStatusEmail(
  order: IOrder,
  stage: FulfillmentStage,
) {
  const ref = orderRef(order);
  const track = `${SITE_URL}/track?ref=${encodeURIComponent(ref)}`;

  const copy: Record<FulfillmentStage, { subject: string; title: string; body: string }> = {
    processing: {
      subject: `We're preparing your order (${ref})`,
      title: "We're preparing your order",
      body:
        p(`Hi ${order.customer.name}, good news, we've started work on your order <strong>${ref}</strong>.`) +
        p("For handmade and made-to-order pieces this is when we crochet it just for you. We'll let you know as soon as it ships.") +
        button(track, "Track your order"),
    },
    shipped: {
      subject: `Your order is on its way (${ref})`,
      title: "Your order is on its way",
      body:
        p(`Hi ${order.customer.name}, your order <strong>${ref}</strong> has been shipped and is on its way to you.`) +
        button(track, "Track your order"),
    },
    delivered: {
      subject: `Your order was delivered (${ref})`,
      title: "Delivered. We hope you love it!",
      body:
        p(`Hi ${order.customer.name}, your order <strong>${ref}</strong> has been delivered.`) +
        p("We'd love to see how you style it. Tag us, and if anything isn't right, just reply to this email.") +
        button(`${SITE_URL}/products`, "Shop again"),
    },
  };

  const c = copy[stage];
  return sendMail({
    to: order.email,
    sender: "orders",
    subject: c.subject,
    title: c.title,
    body: c.body,
  });
}

export async function sendOrderCancelledEmail(order: IOrder) {
  const ref = orderRef(order);
  return sendMail({
    to: order.email,
    sender: "orders",
    subject: `Your order was cancelled (${ref})`,
    title: "Your order was cancelled",
    body:
      p(`Hi ${order.customer.name}, your order <strong>${ref}</strong> has been cancelled.`) +
      p("If you paid for this order, any refund due will be processed to you. If this wasn't expected, please reply and we'll help.") +
      muted("Questions? Email beccasknotique@gmail.com."),
  });
}

// ---------------------------------------------------------------------------
// Refunds & store credit
// ---------------------------------------------------------------------------

export async function sendRefundRequestReceivedEmail(
  to: string,
  name: string,
  ref: string,
) {
  return sendMail({
    to,
    sender: "support",
    subject: `We got your refund request (${ref})`,
    title: "Refund request received",
    body:
      p(`Hi ${name || "there"}, we've received your refund request for order <strong>${ref}</strong>.`) +
      p("Our team will review it and email you the outcome. This usually doesn't take long.") +
      button(`${SITE_URL}/account`, "View your orders"),
  });
}

export async function sendRefundProcessedEmail(
  order: IOrder,
  amount: number,
  method: "store_credit" | "paystack" | "manual",
) {
  const ref = orderRef(order);
  const how =
    method === "store_credit"
      ? "It has been added to your account as store credit, ready to use at checkout."
      : method === "paystack"
        ? "It's on its way back to your card. This can take a few business days to appear, depending on your bank."
        : "We'll arrange the payment with you directly.";
  return sendMail({
    to: order.email,
    sender: "support",
    subject: `Your refund of ${formatNaira(amount)} (${ref})`,
    title: "Your refund has been processed",
    body:
      p(`Hi ${order.customer.name}, we've refunded <strong>${formatNaira(amount)}</strong> for order <strong>${ref}</strong>.`) +
      p(how) +
      (method === "store_credit" ? button(`${SITE_URL}/products`, "Shop with your credit") : ""),
  });
}

export async function sendRefundDeclinedEmail(
  to: string,
  name: string,
  ref: string,
  note?: string,
) {
  return sendMail({
    to,
    sender: "support",
    subject: `Update on your refund request (${ref})`,
    title: "About your refund request",
    body:
      p(`Hi ${name || "there"}, we've reviewed your refund request for order <strong>${ref}</strong> and we're not able to approve it this time.`) +
      (note ? p(`<strong>Note from our team:</strong> ${note}`) : "") +
      muted("If you have questions, reply to this email or contact beccasknotique@gmail.com and we'll be happy to help."),
  });
}

// ---------------------------------------------------------------------------
// Admin notifications
// ---------------------------------------------------------------------------

export async function sendAdminNewRefundRequest(opts: {
  ref: string;
  customerEmail: string;
  amount: number;
  reason: string;
}) {
  const admin = adminAddress();
  if (!admin) return false;
  return sendMail({
    to: admin,
    sender: "notifications",
    subject: `Refund request — ${opts.ref}`,
    title: "New refund request to review",
    body:
      p(`<strong>${opts.customerEmail}</strong> requested a refund for order <strong>${opts.ref}</strong>.`) +
      p(`Reason: ${opts.reason}<br/>Amount requested: ${formatNaira(opts.amount)}`) +
      button(`${SITE_URL}/admin/orders`, "Review in admin"),
  });
}

export async function sendLowStockAlert(
  items: { name: string; stockCount: number; slug: string }[],
) {
  const admin = adminAddress();
  if (!admin || items.length === 0) return false;
  const rows = items
    .map(
      (i) =>
        `<tr>
           <td style="padding:6px 0;border-bottom:1px solid #eee;color:#44403c;">${i.name}</td>
           <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;color:#b91c1c;font-weight:600;">${i.stockCount} left</td>
         </tr>`,
    )
    .join("");
  return sendMail({
    to: admin,
    sender: "notifications",
    subject: `Low stock alert (${items.length} item${items.length === 1 ? "" : "s"})`,
    title: "Some items are running low",
    body:
      p("These ready-made items are running low and may sell out soon:") +
      `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0;">${rows}</table>` +
      button(`${SITE_URL}/admin/products`, "Manage stock"),
  });
}
