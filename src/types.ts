export type MeasurementUnit = "cm" | "in";

export interface MeasurementFieldDef {
  id: string;
  label: string;
  unit: MeasurementUnit;
  /** Soft plausibility bounds, tailor-defined per field. Optional. */
  min?: number;
  max?: number;
  helpText?: string;
}

export interface MeasurementTemplate {
  id: string;
  name: string;
  description?: string;
  fields: MeasurementFieldDef[];
  createdAt: number;
  isCustom: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: number;
}

export type MeasurementMethod = "guided" | "photo";

export interface MeasurementSession {
  id: string;
  clientId: string;
  templateId: string;
  method: MeasurementMethod;
  values: Record<string, number>;
  /** Field ids the tailor confirmed despite a plausibility warning. */
  overriddenWarnings: string[];
  createdAt: number;
}

export interface ValidationWarning {
  fieldId: string;
  message: string;
}
