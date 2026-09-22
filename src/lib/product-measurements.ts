export type RequiredMeasurement = { label: string; unit?: string; guide?: string };

/** Clothing uses a size range; accessories do not. Made-to-order clothes must be measured. */
export function requiresMeasurements(product: { madeToOrder?: boolean; sizes?: string[] }) {
  return Boolean(product.madeToOrder && product.sizes?.length);
}

export function measurementsFor(product: { name?: string; measurementFields?: RequiredMeasurement[] }): RequiredMeasurement[] {
  if (product.measurementFields?.length) return product.measurementFields;
  const name = product.name?.toLowerCase() ?? "";
  if (/shorts|skirt|trouser|pants/.test(name)) return [{ label: "Waist", unit: "cm", guide: "waist" }, { label: "Hip", unit: "cm", guide: "hips" }, { label: "Length", unit: "cm" }];
  if (/shirt|cardigan|vest/.test(name)) return [{ label: "Chest", unit: "cm", guide: "bust" }, { label: "Shoulder", unit: "cm" }, { label: "Length", unit: "cm" }];
  return [{ label: "Bust", unit: "cm", guide: "bust" }, { label: "Waist", unit: "cm", guide: "waist" }, { label: "Hip", unit: "cm", guide: "hips" }, { label: "Length", unit: "cm" }];
}
