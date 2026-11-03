"use client";

import { useId } from "react";
import { Icon } from "./Icon";

export function QuantityControl({ value, max, onChange, name, disabled = false }: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  name: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div role="group" aria-label={`Quantity for ${name}`} className="quantity-control">
      <button type="button" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} aria-label={`Decrease quantity for ${name}`} aria-controls={id}><Icon name="minus" className="size-4" /></button>
      <output id={id} aria-live="polite" aria-label={`Quantity for ${name}`}>{value}</output>
      <button type="button" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label={`Increase quantity for ${name}`} aria-controls={id}><Icon name="plus" className="size-4" /></button>
    </div>
  );
}
