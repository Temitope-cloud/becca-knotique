import "server-only";
import { Resend } from "resend";
import type { IOrder } from "@/lib/models/Order";
import { formatNaira } from "@/lib/money";

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

function fromAddress(): string {
  // e.g. "Becca's Knotique <orders@yourdomain.com>"
  return process.env.EMAIL_FROM || "Becca's Knotique <onboarding@resend.dev>";
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
  <div style="background:#faf7f4;padding:32px 0;font-family:ui-sans-serif,system-ui,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eee;">
      <div style="background:#160f09;padding:24px 28px;">
        <p style="margin:0;color:#fff;font-size:18px;font-weight:700;letter-spacing:0.02em;">Becca&apos;s Knotique</p>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 8px;font-size:20px;color:#1c1917;">${title}</h1>
        ${body}
      </div>
      <div style="padding:18px 28px;border-top:1px solid #f0ede9;color:#a8a29e;font-size:12px;">
        Handmade crochet, made for you.
      </div>
    </div>
  </div>`;
}

/** Sends the customer receipt + the owner notification for a paid order. */
export async function sendOrderEmails(order: IOrder): Promise<void> {
  const resend = getResend();
  if (!resend) return; // not configured yet — skip silently

  const from = fromAddress();
  const admin = adminAddress();
  const shipping = `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state}`;

  const tasks: Promise<unknown>[] = [];

  // Customer receipt
  tasks.push(
    resend.emails.send({
      from,
      to: order.email,
      subject: `Your Becca's Knotique order is confirmed (${order.reference})`,
      html: shell(
        "Thank you for your order!",
        `<p style="color:#57534e;font-size:14px;line-height:1.6;">
           Hi ${order.customer.name}, we&apos;ve received your payment and your order is confirmed.
           We&apos;ll be in touch about delivery to <strong>${shipping}</strong>.
         </p>
         <div style="margin:20px 0;">${itemsTable(order)}</div>
         <p style="color:#a8a29e;font-size:12px;">Order reference: ${order.reference}</p>`,
      ),
    }),
  );

  // Owner notification
  if (admin) {
    tasks.push(
      resend.emails.send({
        from,
        to: admin,
        subject: `New paid order — ${formatNaira(order.amount)} (${order.reference})`,
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
