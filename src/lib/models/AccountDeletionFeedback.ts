import { Schema, model, models, type Model } from "mongoose";

/**
 * Anonymous feedback captured when someone deletes their account. Deliberately
 * stores NO personal data (no email, name, or user id) — just the reason, an
 * optional comment, and whether the account had orders — so it's useful
 * feedback without retaining a deleted user's information.
 */
export interface IAccountDeletionFeedback {
  _id: string;
  reason: string;
  comment?: string;
  hadOrders: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountDeletionFeedbackSchema = new Schema<IAccountDeletionFeedback>(
  {
    reason: { type: String, default: "unspecified", index: true },
    comment: { type: String },
    hadOrders: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const AccountDeletionFeedback: Model<IAccountDeletionFeedback> =
  (models.AccountDeletionFeedback as Model<IAccountDeletionFeedback>) ||
  model<IAccountDeletionFeedback>(
    "AccountDeletionFeedback",
    AccountDeletionFeedbackSchema,
  );
