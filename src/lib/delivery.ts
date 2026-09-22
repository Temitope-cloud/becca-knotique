import "server-only";
import { connectToDatabase } from "@/lib/db";
import { DeliveryZone, type IDeliveryZone } from "@/lib/models/DeliveryZone";
import type { StoreSettings } from "@/lib/settings";

const normalise = (value: string) => value.trim().toLocaleLowerCase("en-NG");

export type DeliveryQuote = { fee: number; eta: string; zoneName?: string; available: boolean };

export async function deliveryQuoteFor(
  settings: StoreSettings,
  city: string,
  state: string,
  subtotal: number,
): Promise<DeliveryQuote> {
  if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) {
    return { fee: 0, eta: "Free delivery", available: true };
  }
  await connectToDatabase();
  const zones = await DeliveryZone.find({ active: true }).lean<IDeliveryZone[]>();
  const place = normalise(city);
  const region = normalise(state);
  const zone = zones.find((item) => item.cities.map(normalise).includes(place)) ??
    zones.find((item) => item.states.map(normalise).includes(region));
  if (zone) return { fee: zone.fee, eta: zone.eta, zoneName: zone.name, available: true };
  if (settings.shippingFee > 0) return { fee: settings.shippingFee, eta: "Delivery time confirmed after order", available: true };
  return { fee: 0, eta: "Delivery quote unavailable", available: false };
}
