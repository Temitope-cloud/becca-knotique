import "server-only";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { sendTwoFactorCode } from "@/lib/email";

const CODE_LIFETIME_MS = 10 * 60 * 1000;

export function newTwoFactorCode(): string {
  return randomInt(100_000, 1_000_000).toString();
}

export async function sendTwoFactorChallenge(userId: string, email: string): Promise<boolean> {
  const code = newTwoFactorCode();
  const sent = await sendTwoFactorCode(email, code);
  if (!sent) return false;

  await connectToDatabase();
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        twoFactorCodeHash: await bcrypt.hash(code, 10),
        twoFactorCodeExpires: new Date(Date.now() + CODE_LIFETIME_MS),
      },
    },
  );
  return true;
}

export async function confirmTwoFactorCode(userId: string, code: string): Promise<boolean> {
  await connectToDatabase();
  const user = await User.findById(userId)
    .select("+twoFactorCodeHash +twoFactorCodeExpires")
    .lean<{ twoFactorCodeHash?: string; twoFactorCodeExpires?: Date }>();
  if (!user?.twoFactorCodeHash || !user.twoFactorCodeExpires || user.twoFactorCodeExpires.getTime() < Date.now()) {
    return false;
  }
  const valid = await bcrypt.compare(code, user.twoFactorCodeHash);
  if (!valid) return false;
  await User.updateOne(
    { _id: userId, twoFactorCodeHash: user.twoFactorCodeHash },
    { $unset: { twoFactorCodeHash: "", twoFactorCodeExpires: "" } },
  );
  return true;
}
