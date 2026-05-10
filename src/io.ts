import {N} from "./constants";
import demUrl from "./dem.png";

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function displayGray(canvasId: string, data: Float64Array, N: number) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  canvas.width = N;
  canvas.height = N;
  const img = new ImageData(N, N);
  for (let i = 0; i < N * N; ++i) {
    const v = clamp(data[i], 0, 1) * 255;
    img.data[4 * i] = v;
    img.data[4 * i + 1] = v;
    img.data[4 * i + 2] = v;
    img.data[4 * i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

// normal buffer layout: [nx: N*N][ny: N*N][nz: N*N][nw: N*N]
// nx/ny/nz in [-1,1], nw = 0 or 1
export function displayNormal(canvasId: string, data: Float64Array, N: number) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d")!;
  canvas.width = N;
  canvas.height = N;
  const img = new ImageData(N, N);
  const nx = data.subarray(0, N * N);
  const ny = data.subarray(N * N, 2 * N * N);
  const nz = data.subarray(2 * N * N, 3 * N * N);
  const nw = data.subarray(3 * N * N, 4 * N * N);
  for (let i = 0; i < N * N; ++i) {
    img.data[4 * i] = clamp((nx[i] + 1) / 2, 0, 1) * 255;
    img.data[4 * i + 1] = clamp((ny[i] + 1) / 2, 0, 1) * 255;
    img.data[4 * i + 2] = clamp((nz[i] + 1) / 2, 0, 1) * 255;
    img.data[4 * i + 3] = nw[i] * 255;
  }
  ctx.putImageData(img, 0, 0);
}

export type Control = { get(): number; set(v: number): void };

export function control(
  elementId: string,
  config: { initialValue: number; onChange(): void }
): Control {
  const el = document.getElementById(elementId) as HTMLInputElement | null;
  if (!el) return {
    get: () => 0, set: () => {
    }
  };
  const label = document.getElementById(elementId + "-val");
  let value = config.initialValue;
  el.value = String(value);
  if (label) label.textContent = String(value);
  el.addEventListener("input", () => {
    value = Number(el.value);
    if (label) label.textContent = el.value;
  });
  el.addEventListener("change", () => config.onChange());
  return {
    get: () => value,
    set: (v) => {
      el.value = String((value = v));
    },
  };
}

export function button(elementId: string, fn: () => void) {
  document.getElementById(elementId)?.addEventListener("click", fn);
}

export async function loadDemData(): Promise<Float64Array> {
  const res = await fetch(demUrl);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(N, N);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, N, N);
  const data = new Float64Array(N * N);
  for (let i = 0; i < N * N; ++i)
    data[i] = imageData.data[4 * i] / 255;
  return data;
}