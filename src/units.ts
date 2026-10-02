import { MeasurementUnit } from "./types";

export const CM_PER_INCH = 2.54;

function roundTo(n: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

export function convertUnit(value: number, fromUnit: MeasurementUnit): { value: number; unit: MeasurementUnit } {
  return fromUnit === "cm"
    ? { value: value / CM_PER_INCH, unit: "in" }
    : { value: value * CM_PER_INCH, unit: "cm" };
}

/** e.g. "90 cm (35.4 in)" */
export function formatWithBothUnits(value: number, unit: MeasurementUnit, decimals = 1): string {
  const converted = convertUnit(value, unit);
  return `${roundTo(value, decimals)} ${unit} (${roundTo(converted.value, decimals)} ${converted.unit})`;
}
