import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Coupon, type ICoupon } from "@/lib/models/Coupon";
import CouponManager, { type CouponRow } from "@/components/admin/CouponManager";

export default async function AdminCouponsPage() {
  await requireAdmin();
  await connectToDatabase();
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean<ICoupon[]>();

  const rows: CouponRow[] = coupons.map((c) => ({
    id: c._id.toString(),
    code: c.code,
    type: c.type,
    value: c.value,
    minOrder: c.minOrder,
    usageLimit: c.usageLimit,
    timesUsed: c.timesUsed,
    expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : null,
    active: c.active,
  }));

  return (
    <div className="px-5 py-8 sm:px-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-stone-900">
        Coupons
      </h1>
      <CouponManager coupons={rows} />
    </div>
  );
}
