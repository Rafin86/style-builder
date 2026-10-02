# Bespoke Measure

A tailor-facing measurement app built with Expo Router, runnable directly in **Expo Go** —
no custom native build required.

- **Approach 3 (guided manual + validation)** is the default flow: step through each
  measurement point with a plausibility rules engine that flags outliers before saving.
- **Approach 1 (photo-assisted)** is available as an optional method: capture two reference
  photos plus a height reference, get prefilled estimates, then confirm or correct every
  value in the same guided flow. Nothing saves without a human pass over the numbers.
- Tailors can define **fully custom measurement templates** — add any category, choose
  cm/in, set optional min/max plausibility bounds — and reuse them per garment style
  (e.g. "Men's dress shirt", "Women's blazer").

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app (iOS or Android). No EAS build, no dev client needed —
everything here uses only Expo-Go-compatible packages (`expo-camera`, `expo-router`,
AsyncStorage).

## Why photo estimation is a stub

On-device pose estimation (MediaPipe, TFLite, etc.) needs custom native modules that Expo Go's
sandboxed runtime doesn't support — that requires a custom development build, which was
explicitly out of scope here. So the architecture instead keeps photo *capture* on-device
(`expo-camera`, fully Expo-Go-compatible) and treats the actual estimation math as a **server
call** — see `src/photoEstimation.ts`. Right now that function simulates a response using rough
population-average body ratios purely so the guided-confirmation UX works end-to-end. Swap in a
real `fetch()` to a backend (e.g. the FastAPI + MediaPipe service from the architecture diagram)
and nothing else in the app needs to change.

## Project structure

```
app/                      Expo Router screens (file-based routing)
  index.tsx               Home dashboard
  templates/               Template list, detail, and the custom-field builder
  clients/                 Client list, detail with measurement history
  measure/                 Method selection, guided stepper, photo capture
src/
  types.ts                Shared types
  storage.ts              AsyncStorage data layer (templates, clients, sessions)
  validation.ts           Plausibility rules engine (min/max + cross-field ratios)
  photoEstimation.ts       Approach 1 stub — swap for a real backend call
  data/defaultTemplates.ts Starter templates seeded on first launch
  components/              FieldInput, ProgressBar
```

## Data model notes

- Templates, clients, and measurement sessions are stored locally via AsyncStorage. This is
  fine for a single tailor on a single device; for a multi-device or multi-tailor setup, swap
  `src/storage.ts` for calls to a real backend — the function signatures are already shaped
  like a CRUD API, so screens don't need to change.
- Each measurement session records which fields (if any) had a plausibility warning the tailor
  chose to override, so you have an audit trail if a garment ends up not fitting.

## Extending

- **Custom templates**: `app/templates/create.tsx` is the field builder. Add a field, pick a
  unit, optionally set min/max. Templates flagged `isCustom: true` are fully tailor-defined.
- **Validation rules**: `src/validation.ts`'s `RATIO_RULES` array is where cross-field sanity
  checks live (e.g. waist-to-chest ratio). Add more rules keyed on label keywords, or wire in
  per-template custom rules if you outgrow the heuristic-by-label-name approach.
- **Real photo estimation**: replace the body of `estimateMeasurementsFromPhotos` in
  `src/photoEstimation.ts` with a `fetch()` to your pose-estimation backend.
