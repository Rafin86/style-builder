import { MeasurementFieldDef } from "./types";

/**
 * IMPORTANT - Expo Go compatibility note:
 *
 * On-device pose estimation (MediaPipe, PoseNet/TFLite, etc.) requires
 * custom native modules that are NOT available inside the sandboxed Expo Go
 * runtime -- only inside a custom development build. To keep this project
 * runnable in plain Expo Go, photo capture happens on-device (expo-camera,
 * which IS supported in Expo Go) and the actual pose-estimation math is
 * expected to run server-side: this function is the seam where you'd POST
 * the two photos + the reference height to your own backend (e.g. the
 * FastAPI + MediaPipe service described in the architecture diagram) and
 * get real estimated measurements back.
 *
 * Until that backend exists, this returns a simulated estimate derived
 * from the reference height using rough population-average body ratios,
 * purely so the guided flow has something to prefill and the tailor can
 * see the "confirm every field" UX end-to-end. Replace the body of this
 * function with a real fetch() call when the backend is ready -- nothing
 * else in the app needs to change.
 */
export async function estimateMeasurementsFromPhotos(params: {
  frontPhotoUri: string;
  sidePhotoUri: string;
  referenceHeightCm: number;
  fields: MeasurementFieldDef[];
}): Promise<Record<string, number>> {
  const { referenceHeightCm, fields } = params;

  // TODO: replace with a real call, e.g.:
  // const form = new FormData();
  // form.append("front", { uri: params.frontPhotoUri, name: "front.jpg", type: "image/jpeg" } as any);
  // form.append("side", { uri: params.sidePhotoUri, name: "side.jpg", type: "image/jpeg" } as any);
  // form.append("referenceHeightCm", String(referenceHeightCm));
  // const res = await fetch("https://your-backend.example.com/estimate", { method: "POST", body: form });
  // return await res.json();

  await new Promise((resolve) => setTimeout(resolve, 1200)); // simulate network latency

  const h = referenceHeightCm;
  const roughRatios: Record<string, number> = {
    neck: 0.21,
    chest: 0.52,
    waist: 0.46,
    hip: 0.54,
    shoulder: 0.235,
    sleeve: 0.35,
    "shirt-length": 0.4,
    inseam: 0.45,
    outseam: 0.6,
    thigh: 0.32,
  };

  const estimates: Record<string, number> = {};
  for (const field of fields) {
    const key = Object.keys(roughRatios).find((k) => field.id.includes(k) || field.label.toLowerCase().includes(k));
    if (!key) continue;
    const jitter = 0.97 + Math.random() * 0.06; // +/- 3% noise so it doesn't look suspiciously exact
    const valueCm = h * roughRatios[key] * jitter;
    estimates[field.id] = field.unit === "in" ? Math.round((valueCm / 2.54) * 10) / 10 : Math.round(valueCm * 10) / 10;
  }
  return estimates;
}
