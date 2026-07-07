// Money is stored as Prisma Decimal. Everywhere in the app we work with plain
// `number` after converting at the DB boundary, so these helpers take numbers.

export function formatINR(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    value
  );
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Prisma Decimal | number | string -> number */
export function toNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}
