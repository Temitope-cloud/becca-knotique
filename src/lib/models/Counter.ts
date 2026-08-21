import { Schema, model, models, type Model } from "mongoose";

interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String },
  seq: { type: Number, default: 1000 },
});

const Counter: Model<ICounter> =
  (models.Counter as Model<ICounter>) ||
  model<ICounter>("Counter", CounterSchema);

/**
 * Short, human-friendly, sequential order number (e.g. "BK-1042").
 * Atomic ($inc + upsert) so concurrent checkouts never collide.
 * Starts at BK-1001.
 */
export async function nextOrderNumber(): Promise<string> {
  const doc = await Counter.findByIdAndUpdate(
    "orderNumber",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return `BK-${doc!.seq}`;
}
