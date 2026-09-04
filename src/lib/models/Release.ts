import { Schema, model, models, type Model } from "mongoose";

export type ReleaseTag = "launch" | "feature" | "improvement" | "fix";

export interface IRelease {
  _id: string;
  /** ISO date, e.g. "2026-09-04". Stored as a string so it sorts chronologically. */
  date: string;
  title: string;
  tag: ReleaseTag;
  items: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReleaseSchema = new Schema<IRelease>(
  {
    date: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    tag: {
      type: String,
      enum: ["launch", "feature", "improvement", "fix"],
      default: "improvement",
    },
    items: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const Release: Model<IRelease> =
  (models.Release as Model<IRelease>) || model<IRelease>("Release", ReleaseSchema);
