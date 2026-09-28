import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DeliveryZone, type IDeliveryZone } from "@/lib/models/DeliveryZone";

export const runtime = "nodejs";

/**
 * The checkout only exposes locations the store can currently deliver to.
 * Keeping this separate from the quote endpoint makes the fields easy to use
 * without exposing pricing or internal zone names before a city is chosen.
 */
export async function GET() {
  await connectToDatabase();
  const zones = await DeliveryZone.find({ active: true })
    .select({ states: 1, cities: 1 })
    .lean<IDeliveryZone[]>();

  const locations = new Map<string, { state: string; cities: Map<string, string> }>();
  for (const zone of zones) {
    for (const state of zone.states) {
      const stateName = state.trim();
      if (!stateName) continue;
      const stateKey = stateName.toLocaleLowerCase("en-NG");
      const location = locations.get(stateKey) ?? { state: stateName, cities: new Map<string, string>() };
      locations.set(stateKey, location);
      for (const city of zone.cities) {
        const cityName = city.trim();
        if (cityName) location.cities.set(cityName.toLocaleLowerCase("en-NG"), cityName);
      }
    }
  }

  const states = [...locations.entries()]
    .map(([, location]) => ({
      state: location.state,
      cities: [...location.cities.values()].sort((a, b) => a.localeCompare(b, "en-NG")),
    }))
    .sort((a, b) => a.state.localeCompare(b.state, "en-NG"));

  return NextResponse.json({ origin: "Challenge, Ibadan", states });
}
