import { MeasurementTemplate } from "../types";

export const DEFAULT_TEMPLATES: MeasurementTemplate[] = [
  {
    id: "tpl-mens-shirt",
    name: "Men's dress shirt",
    description: "Standard points for a made-to-measure shirt.",
    isCustom: false,
    createdAt: Date.now(),
    fields: [
      { id: "neck", label: "Neck", unit: "cm", min: 30, max: 55 },
      { id: "chest", label: "Chest", unit: "cm", min: 70, max: 150 },
      { id: "waist", label: "Waist", unit: "cm", min: 60, max: 150 },
      { id: "shoulder", label: "Shoulder width", unit: "cm", min: 35, max: 60 },
      { id: "sleeve", label: "Sleeve length", unit: "cm", min: 50, max: 75 },
      { id: "shirt-length", label: "Shirt length", unit: "cm", min: 60, max: 90 },
    ],
  },
  {
    id: "tpl-trousers",
    name: "Trousers",
    description: "Standard points for made-to-measure trousers.",
    isCustom: false,
    createdAt: Date.now(),
    fields: [
      { id: "waist", label: "Waist", unit: "cm", min: 60, max: 150 },
      { id: "hip", label: "Hip", unit: "cm", min: 70, max: 160 },
      { id: "inseam", label: "Inseam", unit: "cm", min: 60, max: 95 },
      { id: "outseam", label: "Outseam", unit: "cm", min: 90, max: 130 },
      { id: "thigh", label: "Thigh", unit: "cm", min: 40, max: 80 },
    ],
  },
];
