import Link from "next/link";
import { hasActiveFilters, type ProductFilters as Filters } from "@/lib/products";
import { PEARL_TYPE_LABELS, type PearlType } from "@/lib/types";

const fieldClass =
  "rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none";

/**
 * Plain GET form: submitting it updates the URL (?type=…&min=…&max=…),
 * so filtered views can be bookmarked and shared, and it works without JavaScript.
 */
export function ProductFilters({ filters }: { filters: Filters }) {
  const isFiltered = hasActiveFilters(filters);

  return (
    <form method="get" action="/" className="flex flex-wrap items-end justify-center gap-3">
      <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-stone-500">
        Pearl type
        <select name="type" defaultValue={filters.type ?? ""} className={fieldClass}>
          <option value="">All types</option>
          {(Object.keys(PEARL_TYPE_LABELS) as PearlType[]).map((type) => (
            <option key={type} value={type}>
              {PEARL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-stone-500">
        Min (RM)
        <input
          type="number"
          name="min"
          min={0}
          step={1}
          inputMode="numeric"
          placeholder="0"
          defaultValue={filters.minCents !== undefined ? filters.minCents / 100 : ""}
          className={`${fieldClass} w-28`}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-stone-500">
        Max (RM)
        <input
          type="number"
          name="max"
          min={0}
          step={1}
          inputMode="numeric"
          placeholder="Any"
          defaultValue={filters.maxCents !== undefined ? filters.maxCents / 100 : ""}
          className={`${fieldClass} w-28`}
        />
      </label>

      <button
        type="submit"
        className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700"
      >
        Apply
      </button>

      {isFiltered && (
        <Link href="/" className="px-2 py-2 text-sm text-stone-500 underline hover:text-stone-900">
          Clear
        </Link>
      )}
    </form>
  );
}
