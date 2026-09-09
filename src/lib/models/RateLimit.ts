import { Schema, model, models, type Model } from "mongoose";

/**
 * Fixed-window rate-limit counters. `_id` encodes action + identifier + time
 * bucket. A TTL index removes expired windows automatically, so the collection
 * stays small without any cleanup job.
 */
export interface IRateLimit {
  _id: string;
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    _id: { type: String },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date },
  },
  { versionKey: false },
);

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit: Model<IRateLimit> =
  (models.RateLimit as Model<IRateLimit>) ||
  model<IRateLimit>("RateLimit", RateLimitSchema);
