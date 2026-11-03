// Shared display rules; checkout always applies these to the DB subtotal.
export const SHIPPING_RULES = {
  MY: { countryName: "Malaysia", displayName: "Malaysia standard", feeCents: 1_000, freeFromCents: 30_000 },
  SG: { countryName: "Singapore", displayName: "Singapore standard", feeCents: 2_500, freeFromCents: 50_000 },
} as const;

export type ShippingCountry = keyof typeof SHIPPING_RULES;

export function isShippingCountry(value: unknown): value is ShippingCountry {
  return value === "MY" || value === "SG";
}

export function shippingCents(country: ShippingCountry, subtotalCents: number): number {
  const rule = SHIPPING_RULES[country];
  return subtotalCents >= rule.freeFromCents ? 0 : rule.feeCents;
}
