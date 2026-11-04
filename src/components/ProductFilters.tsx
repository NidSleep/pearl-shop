import Link from "next/link";
import { hasActiveFilters, type ProductFilters as Filters } from "@/lib/products";
import { PEARL_TYPE_LABELS, type PearlType } from "@/lib/types";

const fieldClass = "field";

/**
 * Plain GET form: submitting it updates the URL (?type=…&min=…&max=…),
 * so filtered views can be bookmarked and shared, and it works without JavaScript.
 */
export function ProductFilters({ filters }: { filters: Filters }) {
  const isFiltered = hasActiveFilters(filters);

  return (
    <form method="get" action="/#collection" className="filter-bar" aria-label="Filter the collection">
      <label className="field-label filter-type">
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

      <label className="field-label">
        Min price (RM)
        <input
          type="number"
          name="min"
          min={0}
          step={1}
          inputMode="numeric"
          placeholder="0"
          defaultValue={filters.minCents !== undefined ? filters.minCents / 100 : ""}
          className={fieldClass}
        />
      </label>

      <label className="field-label">
        Max price (RM)
        <input
          type="number"
          name="max"
          min={0}
          step={1}
          inputMode="numeric"
          placeholder="Any"
          defaultValue={filters.maxCents !== undefined ? filters.maxCents / 100 : ""}
          className={fieldClass}
        />
      </label>

      <button
        type="submit"
        className="button"
      >
        Apply filters
      </button>

      {isFiltered && (
        <Link href="/#collection" className="text-link justify-center">
          Reset
        </Link>
      )}
    </form>
  );
}
