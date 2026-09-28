export type DeliveryTimingItem = {
  name: string;
  madeToOrder?: boolean;
  leadTime?: string;
};

function maximumDays(leadTime?: string): number {
  if (!leadTime) return 0;
  const values = [...leadTime.matchAll(/\d+/g)].map((match) => Number(match[0]));
  if (!values.length) return 0;
  const largest = Math.max(...values);
  return /week/i.test(leadTime) ? largest * 7 : largest;
}

/** The slowest item determines when a mixed order can leave the studio. */
export function preparationTiming(items: DeliveryTimingItem[]) {
  const slowest = [...items].sort(
    (left, right) => maximumDays(right.leadTime) - maximumDays(left.leadTime),
  )[0];
  const leadTime = slowest?.leadTime || "1 to 2 business days";
  const madeToOrder = items.some((item) => item.madeToOrder);
  return {
    leadTime,
    label: madeToOrder
      ? `Your order will be ready in about ${leadTime}.`
      : `Your order will be ready in ${leadTime}.`,
  };
}
