import { MeasurementFieldDef, ValidationWarning } from "./types";

// Ratio checks are heuristics, not clinical fact. They exist to catch the
// two most common data-entry errors: a transposed digit (89 -> 98) and a
// wrong-unit entry (inches typed into a cm field). They only fire when the
// template happens to use these common label names -- fully custom fields
// with no recognizable name just fall back to min/max checks.
type RatioRule = {
  a: string;
  b: string;
  minRatio: number;
  maxRatio: number;
  message: string;
};

const RATIO_RULES: RatioRule[] = [
  {
    a: "waist",
    b: "chest",
    minRatio: 0.6,
    maxRatio: 1.15,
    message: "Waist looks unusual relative to chest. Double-check both values.",
  },
  {
    a: "hip",
    b: "chest",
    minRatio: 0.7,
    maxRatio: 1.25,
    message: "Hip looks unusual relative to chest. Double-check both values.",
  },
  {
    a: "neck",
    b: "chest",
    minRatio: 0.28,
    maxRatio: 0.45,
    message: "Neck looks unusual relative to chest. Double-check both values.",
  },
  {
    a: "sleeve",
    b: "shoulder",
    minRatio: 1.0,
    maxRatio: 2.4,
    message: "Sleeve length looks unusual relative to shoulder width.",
  },
];

function findField(fields: MeasurementFieldDef[], keyword: string): MeasurementFieldDef | undefined {
  return fields.find((f) => f.label.toLowerCase().includes(keyword));
}

export function validateMeasurements(
  fields: MeasurementFieldDef[],
  values: Record<string, number>
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // 1. Per-field min/max bounds set by the tailor on the template.
  for (const field of fields) {
    const value = values[field.id];
    if (value === undefined || Number.isNaN(value)) continue;
    if (field.min !== undefined && value < field.min) {
      warnings.push({
        fieldId: field.id,
        message: `${field.label} (${value}${field.unit}) is below the expected minimum of ${field.min}${field.unit}.`,
      });
    }
    if (field.max !== undefined && value > field.max) {
      warnings.push({
        fieldId: field.id,
        message: `${field.label} (${value}${field.unit}) is above the expected maximum of ${field.max}${field.unit}.`,
      });
    }
  }

  // 2. Cross-field anthropometric ratio checks, only when both fields exist
  // by recognizable name and share the same unit.
  for (const rule of RATIO_RULES) {
    const fieldA = findField(fields, rule.a);
    const fieldB = findField(fields, rule.b);
    if (!fieldA || !fieldB || fieldA.unit !== fieldB.unit) continue;
    const valueA = values[fieldA.id];
    const valueB = values[fieldB.id];
    if (!valueA || !valueB) continue;
    const ratio = valueA / valueB;
    if (ratio < rule.minRatio || ratio > rule.maxRatio) {
      warnings.push({ fieldId: fieldA.id, message: rule.message });
    }
  }

  return warnings;
}
