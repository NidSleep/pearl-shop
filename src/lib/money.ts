export function formatPrice(cents: number, currency = "myr"): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
