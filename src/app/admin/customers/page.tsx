import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { User, type IUser } from "@/lib/models/User";
import { Order } from "@/lib/models/Order";
import { formatNaira } from "@/lib/money";

interface SpendRow {
  _id: string;
  orders: number;
  spend: number;
}

export default async function AdminCustomersPage() {
  await requireAdmin();
  await connectToDatabase();

  const [users, spend] = await Promise.all([
    User.find({ role: { $ne: "admin" } })
      .sort({ createdAt: -1 })
      .lean<IUser[]>(),
    Order.aggregate<SpendRow>([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$email",
          orders: { $sum: 1 },
          spend: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const byEmail = new Map(spend.map((s) => [s._id, s]));

  return (
    <div className="px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
        Customers
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {users.length} registered customer{users.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Sign-in</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total spent</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-stone-500">
                  No customers yet.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const agg = byEmail.get(u.email.toLowerCase());
                return (
                  <tr
                    key={u.email}
                    className="border-b border-stone-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-900">{u.name}</p>
                      <p className="text-xs text-stone-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-500">
                      {new Date(u.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-stone-500 capitalize">
                      {u.provider}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {agg?.orders ?? 0}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap text-stone-900">
                      {formatNaira(agg?.spend ?? 0)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
