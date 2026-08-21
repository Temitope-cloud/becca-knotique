import { Schema, model, models, type Model } from "mongoose";

export type UserRole = "customer" | "admin";
export type AuthProvider = "credentials" | "google";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  /** bcrypt hash — absent for OAuth-only (Google) accounts */
  password?: string;
  image?: string;
  provider: AuthProvider;
  role: UserRole;
  phone?: string;
  wishlist: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, select: false },
    image: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    phone: { type: String },
    wishlist: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", UserSchema);
