import "server-only";
import { connectToDatabase } from "@/lib/db";
import { DeliveryZone, type IDeliveryZone } from "@/lib/models/DeliveryZone";
import type { StoreSettings } from "@/lib/settings";

const normalise = (value: string) => value.trim().toLocaleLowerCase("en-NG");

export type DeliveryQuote = {
  fee: number;
  eta: string;
  zoneName?: string;
  fulfillmentMethod?: "door_delivery" | "park_pickup";
  available: boolean;
};

export async function deliveryQuoteFor(
  settings: StoreSettings,
  city: string,
  state: string,
  subtotal: number,
): Promise<DeliveryQuote> {
  await connectToDatabase();
  const zones = await DeliveryZone.find({ active: true }).lean<IDeliveryZone[]>();
  const place = normalise(city);
  const region = normalise(state);
  const zone = zones.find((item) => item.cities.map(normalise).includes(place)) ??
    zones.find((item) => item.states.map(normalise).includes(region));
  if (zone) return {
    fee: settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold ? 0 : zone.fee,
    eta: zone.eta,
    zoneName: zone.name,
    fulfillmentMethod: zone.fulfillmentMethod ?? "park_pickup",
    available: true,
  };
  if (settings.shippingFee > 0) return { fee: settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee, eta: "Delivery time confirmed after order", fulfillmentMethod: "park_pickup", available: true };
  return { fee: 0, eta: "Delivery quote unavailable", available: false };
}
