# Becca's Knotique — Admin Guide

A plain-English guide to running the store. No coding needed.

---

## 1. Getting into the admin

1. Go to **your-site.com/signup** and create an account using the **admin email**
   set in your environment (`ADMIN_EMAIL`). Currently that's
   **beccasknotique@gmail.com**. Whoever signs up (or signs in with Google) using
   that exact email automatically becomes the admin.
2. Once signed in, go to **/admin**. You'll see the dashboard.
3. Anyone else who signs up is a normal customer and cannot see /admin.

> To change who the admin is, update `ADMIN_EMAIL` in your environment variables
> and have that person sign up / sign in.

---

## 2. Dashboard (`/admin`)

At a glance:

- **Revenue (paid)** — total from paid orders, plus this month's figure.
- **Orders / Customers / Products** — quick counts.
- **Recent orders** — the latest 6; click any to open it.
- **Best sellers** — top products by quantity sold.
- **Low stock** — products with 3 or fewer left. Click to restock.

---

## 3. Products (`/admin/products`)

- **Add a product:** click **Add product**, fill in the details, upload photos,
  set price/stock, then **Create product**.
- **Photos:** click the **Upload** box — this opens the Cloudinary uploader.
  Choose from your device, a URL, or camera. The **first image** is the main
  photo shown to customers.
- **Pricing:** *Price* is what customers pay. *Compare-at price* is the crossed-out
  "old" price (used for the "Save %" badge). Leave it blank for no discount.
- **Stock count:** decreases automatically when an order is paid. At 0 the product
  is marked out of stock.
- **Visibility toggles:**
  - **In stock** — customers can buy it.
  - **Active** — shown in the store (turn off to hide without deleting).
  - **Featured** — appears in the homepage "Featured piece" section.
- **Edit / delete:** click **Edit** on any product. Delete is at the bottom of the
  edit form.

Changes appear on the storefront immediately.

---

## 4. Orders (`/admin/orders`)

- Filter by payment status with the tabs (All / Pending / Paid / Failed / Cancelled).
- Click any order to open it. There you can see the items, customer details, and
  delivery address, and update two things:
  - **Payment status** — normally set automatically by Paystack; you can override
    it if needed.
  - **Fulfillment** — your delivery progress: *Unfulfilled → Processing → Shipped →
    Delivered*. Update this as you prepare and send each order.

When an order is paid, the customer gets a receipt email and you get a
new-order alert (once email is set up — see section 8).

---

## 5. Customers (`/admin/customers`)

A list of everyone who created an account: when they joined, how they sign in
(email or Google), how many orders they've paid for, and their total spend.

---

## 6. Coupons (`/admin/coupons`)

- **Create a coupon:** enter a code (e.g. `WELCOME10`), choose **Percentage** or
  **Fixed ₦**, set the amount, and optionally a **minimum order**, **usage limit**,
  and **expiry date**. Click **Create coupon**.
- Customers enter the code at checkout; the discount applies automatically if valid.
- Toggle a coupon **Active/Inactive** by clicking its status, or delete it with the
  trash icon.
- "Used" shows how many times it's been redeemed (and the limit, if any).

---

## 7. Settings (`/admin/settings`)

- **Store name** and **support email / WhatsApp phone**.
- **Announcement banner** — a message shown across the top of the whole store
  (e.g. "Free shipping on orders over ₦100,000"). Leave blank to hide it.
- **Shipping:**
  - **Delivery fee** — a flat fee added at checkout. Set 0 to keep "arranged after
    checkout".
  - **Free shipping over** — orders at/above this amount ship free. Set 0 to disable.

---

## 8. How payments & emails work

- **Payments:** handled by **Paystack**. Customers pay by card/transfer; on success
  they return to a confirmation page and the order is marked **Paid**. A background
  webhook confirms payment even if they close the tab.
- **Emails:** handled by **Resend**. When set up, paid orders trigger a customer
  receipt and an owner alert. Until the Resend key is added, orders still work —
  they just don't email.

---

## 9. Environment variables (for the developer)

These live in `.env.local` for local work and must **also** be set in **Vercel →
Settings → Environment Variables** for the live site (then redeploy):

| Variable | What it's for |
|---|---|
| `MONGODB_URI` | Database |
| `AUTH_SECRET` | Login security (generate with `openssl rand -base64 32`) |
| `AUTH_URL` | Live site origin, e.g. `https://beccasknotique.vercel.app` (no path) |
| `NEXT_PUBLIC_BASE_URL` | Same as AUTH_URL |
| `ADMIN_EMAIL` | Who gets admin access |
| `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Payments |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google sign-in |
| `RESEND_API_KEY` / `EMAIL_FROM` / `ORDER_NOTIFICATION_EMAIL` | Emails |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image storage |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Image uploader |

**Paystack dashboard:** set the **Callback URL** to `<site>/order/callback` and the
**Webhook URL** to `<site>/api/paystack/webhook`.

---

## 10. First-time setup checklist

1. Sign up with the admin email → open `/admin`.
2. In **Settings**, set your shipping fee, banner, and contact info.
3. In **Products**, review the imported items; add photos/stock as needed.
4. Create any launch **Coupons**.
5. Do a test purchase (use Paystack **test** keys first) to confirm the flow and
   emails, then switch to live keys.

That's it — you're running a full store. 🧶
