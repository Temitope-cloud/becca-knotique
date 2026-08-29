export type ReleaseTag = "launch" | "feature" | "improvement" | "fix";

export interface Release {
  date: string; // ISO date, e.g. "2026-08-24"
  title: string;
  tag: ReleaseTag;
  items: string[];
}

/**
 * Release log for Becca's Knotique (newest first).
 * Add a new entry at the top whenever something ships.
 */
export const releases: Release[] = [
  {
    date: "2026-08-29",
    title: "Search engine (SEO) groundwork",
    tag: "improvement",
    items: [
      "Added rich 'structured data' across the site so Google understands the brand, products (with price and availability), articles, and breadcrumbs — the groundwork for rich results and a brand panel.",
      "Search engines are now steered away from private pages (cart, checkout, account, admin) and pointed at the sitemap, which now includes the shop, journal, and trending pages.",
      "Added a spot to plug in the Google Search Console verification code, an app manifest, and a working product search link, and fixed the site to use one consistent web address everywhere.",
    ],
  },
  {
    date: "2026-08-29",
    title: "Stock, draft & order-tracking fixes",
    tag: "fix",
    items: [
      "Order tracking now requires the correct email that matches the order number, so no one can look up an order with just the number. The email is filled in automatically when you're signed in.",
      "Fixed a rare case where opening the mobile menu and then using the browser's back button could leave a page unable to scroll.",
      "Ready-made products now correctly sell out when their stock reaches 0: the page shows 'Sold out' and the buy buttons are disabled, even if the 'In stock' toggle was left on. This is also enforced at checkout, so an out-of-stock item can never be ordered.",
      "Added a gentle 'Only N left' note when a ready-made item is running low, and the quantity picker won't let a customer add more than are in stock.",
      "Draft products are now fully hidden from customers: their product page returns 'not found' and they cannot be added to cart or bought, even with a direct link. As the admin, you can still open the page to preview it (with a clear 'Admin preview' notice).",
      "Removed 'Featured' from the top menu and made the menu links a little larger.",
      "The 'Shop the collection' button on journal posts now goes to the products page.",
    ],
  },
  {
    date: "2026-08-25",
    title: "The Journal, made-to-order products & helpful tooltips",
    tag: "feature",
    items: [
      "New Journal (blog) with a proper writing editor: write posts with headings, bold, lists, quotes, links and images, save drafts, publish, and move posts to trash.",
      "Readers get a clean Journal page and article pages, linked from the top menu and footer, and every published post is added to the sitemap for Google.",
      "Products can be marked 'Made to order' (crocheted after you order) or ready-made. Made-to-order items never run out of stock and show their make time.",
      "Clearer product wording: it now says whether the wait is for making the piece or just delivering it.",
      "Added helpful hover tooltips across the store, including plain-English explanations of every figure on the Finance page.",
    ],
  },
  {
    date: "2026-08-24",
    title: "Made-to-measure & homepage polish",
    tag: "feature",
    items: [
      "Switched to made-to-measure ordering and removed fixed S/M/L sizes.",
      "Custom orders can now include exact measurements, a custom colour, and a reference photo.",
      "Measurement fields are now a tap-to-select list of common tailor terms, plus your own custom ones.",
      "The homepage 'Just Dropped' grid and 'Limited Edition' spotlight are now driven by the products you mark as Featured.",
      "Product cards on the homepage are now all the same height.",
      "Friendlier, dismissible product reminder with a 'Chat about fit or delivery' button.",
    ],
  },
  {
    date: "2026-08-23",
    title: "Business finance module",
    tag: "feature",
    items: [
      "New admin-only Finance section: overview, ledger, expenses, salary & drawings, and taxes.",
      "Every paid order automatically records its revenue, the real Paystack fee, and cost of goods.",
      "Past orders were imported, with a button to re-sync anytime.",
      "Clear split between money in, profit, salary, owner drawings, and a tax set-aside.",
      "Added a show/hide password toggle on login and sign up.",
    ],
  },
  {
    date: "2026-08-21",
    title: "New brand look & major storefront upgrades",
    tag: "improvement",
    items: [
      "Refreshed the whole site to the white, black and emerald brand look (removed the brown).",
      "Redesigned the shop page with filters (women/men, price, search) and quick add-to-cart.",
      "Added a Trending page, a wishlist, and product view tracking.",
      "Redesigned the cart and checkout, moved coupons to the cart, and added a checkout progress bar.",
      "Added product sharing (WhatsApp, X, Facebook, copy link).",
      "Short, memorable order numbers (like BK-1042).",
      "Admin: product drafts, trash & restore, a Featured filter, and a fixed multi-image upload.",
      "Custom branded 'page not found' screen and a rewritten Our Story page.",
      "Images now load directly from Cloudinary for speed.",
    ],
  },
  {
    date: "2026-08-20",
    title: "Store foundations on the cloud",
    tag: "improvement",
    items: [
      "Full admin panel, with the product catalog moved to a proper database.",
      "Added an order tracking system for customers.",
      "Moved all images and video to Cloudinary hosting.",
    ],
  },
  {
    date: "2026-08-18",
    title: "Online store added (started taking payments)",
    tag: "feature",
    items: [
      "Turned the brand website into a working shop.",
      "Customers can create accounts, add to cart, check out, and pay with Paystack.",
      "Admin dashboard to manage orders.",
      "Refreshed footer and featured section; email and image hosting set up.",
    ],
  },
  {
    date: "2026-05-12",
    title: "Becca's Knotique website launched",
    tag: "launch",
    items: [
      "The original brand website went live: homepage with a hero, featured pieces, Our Story, the crochet process, and reviews.",
      "Product showcase and detail pages, plus a 'most viewed' chart.",
      "About, Our Story, Contact, and legal pages.",
      "The handmade look, custom fonts, and page animations.",
      "Built from March 2026. (At this stage the site showed the collection; online payments came later.)",
    ],
  },
];
