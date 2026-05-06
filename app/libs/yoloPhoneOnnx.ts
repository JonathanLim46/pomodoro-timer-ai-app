import * as ort from "onnxruntime-web";
import type { PhoneDetection } from "./temporalRules";

export type YoloPhoneConfig = {
  inputSize: number;
  confidenceThreshold: number;
  iouThreshold: number;
  className: "handphone";
};

export const DEFAULT_YOLO_PHONE_CONFIG: YoloPhoneConfig = {
  inputSize: 768,
  confidenceThreshold: 0.25,
  iouThreshold: 0.45,
  className: "handphone",
};

type PreprocessResult = {
  tensorData: Float32Array;
  scale: number;
  padX: number;
  padY: number;
  srcWidth: number;
  srcHeight: number;
};

export async function createYoloPhoneSession(modelUrl: string) {
  return await ort.InferenceSession.create(modelUrl, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
}

export async function detectPhoneFromVideo(
  session: ort.InferenceSession,
  video: HTMLVideoElement,
  config: Partial<YoloPhoneConfig> = {},
): Promise<PhoneDetection[]> {
  const finalConfig = {
    ...DEFAULT_YOLO_PHONE_CONFIG,
    ...config,
  };

  if (!video.videoWidth || !video.videoHeight) {
    return [];
  }

  const input = preprocessVideo(video, finalConfig.inputSize);

  const tensor = new ort.Tensor("float32", input.tensorData, [
    1,
    3,
    finalConfig.inputSize,
    finalConfig.inputSize,
  ]);

  const feeds: Record<string, ort.Tensor> = {
    [session.inputNames[0]]: tensor,
  };

  const outputMap = await session.run(feeds);
  const output = outputMap[session.outputNames[0]];

  const rows = outputToRows(output.data as Float32Array, output.dims);

  const decoded = decodeYoloRows(rows, input, finalConfig);

  return nonMaxSuppression(decoded, finalConfig.iouThreshold);
}

function preprocessVideo(
  video: HTMLVideoElement,
  inputSize: number,
): PreprocessResult {
  const srcWidth = video.videoWidth;
  const srcHeight = video.videoHeight;

  const scale = Math.min(inputSize / srcWidth, inputSize / srcHeight);
  const resizedWidth = Math.round(srcWidth * scale);
  const resizedHeight = Math.round(srcHeight * scale);

  const padX = Math.floor((inputSize - resizedWidth) / 2);
  const padY = Math.floor((inputSize - resizedHeight) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = inputSize;
  canvas.height = inputSize;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context tidak tersedia.");
  }

  ctx.fillStyle = "rgb(114, 114, 114)";
  ctx.fillRect(0, 0, inputSize, inputSize);

  ctx.drawImage(video, padX, padY, resizedWidth, resizedHeight);

  const imageData = ctx.getImageData(0, 0, inputSize, inputSize);
  const pixels = imageData.data;

  const tensorData = new Float32Array(3 * inputSize * inputSize);
  const area = inputSize * inputSize;

  for (let i = 0; i < area; i++) {
    const pixelIndex = i * 4;

    const r = pixels[pixelIndex] / 255;
    const g = pixels[pixelIndex + 1] / 255;
    const b = pixels[pixelIndex + 2] / 255;

    tensorData[i] = r;
    tensorData[area + i] = g;
    tensorData[area * 2 + i] = b;
  }

  return {
    tensorData,
    scale,
    padX,
    padY,
    srcWidth,
    srcHeight,
  };
}

function outputToRows(data: Float32Array, dims: readonly number[]): number[][] {
  if (dims.length !== 3) {
    console.warn("Format output ONNX belum didukung:", dims);
    return [];
  }

  const dim1 = dims[1];
  const dim2 = dims[2];

  const rows: number[][] = [];

  // [1, features, boxes]
  if (dim1 < dim2) {
    const features = dim1;
    const boxes = dim2;

    for (let boxIndex = 0; boxIndex < boxes; boxIndex++) {
      const row: number[] = [];

      for (let featureIndex = 0; featureIndex < features; featureIndex++) {
        row.push(data[featureIndex * boxes + boxIndex]);
      }

      rows.push(row);
    }

    return rows;
  }

  // [1, boxes, features]
  const boxes = dim1;
  const features = dim2;

  for (let boxIndex = 0; boxIndex < boxes; boxIndex++) {
    const row: number[] = [];

    for (let featureIndex = 0; featureIndex < features; featureIndex++) {
      row.push(data[boxIndex * features + featureIndex]);
    }

    rows.push(row);
  }

  return rows;
}

function decodeYoloRows(
  rows: number[][],
  input: PreprocessResult,
  config: YoloPhoneConfig,
): PhoneDetection[] {
  const detections: PhoneDetection[] = [];

  for (const row of rows) {
    if (row.length < 5) continue;

    const [cx, cy, w, h] = row;
    const score = row[4];

    if (score < config.confidenceThreshold) continue;

    const x1Model = cx - w / 2;
    const y1Model = cy - h / 2;
    const x2Model = cx + w / 2;
    const y2Model = cy + h / 2;

    const x1 = clamp((x1Model - input.padX) / input.scale, 0, input.srcWidth);
    const y1 = clamp((y1Model - input.padY) / input.scale, 0, input.srcHeight);
    const x2 = clamp((x2Model - input.padX) / input.scale, 0, input.srcWidth);
    const y2 = clamp((y2Model - input.padY) / input.scale, 0, input.srcHeight);

    const boxWidth = Math.max(0, x2 - x1);
    const boxHeight = Math.max(0, y2 - y1);

    if (boxWidth <= 1 || boxHeight <= 1) continue;

    const areaRatio =
      (boxWidth * boxHeight) / (input.srcWidth * input.srcHeight);

    detections.push({
      bbox: [x1, y1, x2, y2],
      score,
      className: config.className,
      areaRatio,
    });
  }

  return detections;
}

function nonMaxSuppression(
  detections: PhoneDetection[],
  iouThreshold: number,
): PhoneDetection[] {
  const sorted = [...detections].sort((a, b) => b.score - a.score);
  const selected: PhoneDetection[] = [];

  while (sorted.length > 0) {
    const current = sorted.shift();

    if (!current) break;

    selected.push(current);

    for (let i = sorted.length - 1; i >= 0; i--) {
      const overlap = iou(current.bbox, sorted[i].bbox);

      if (overlap >= iouThreshold) {
        sorted.splice(i, 1);
      }
    }
  }

  return selected;
}

function iou(
  a: [number, number, number, number],
  b: [number, number, number, number],
): number {
  const x1 = Math.max(a[0], b[0]);
  const y1 = Math.max(a[1], b[1]);
  const x2 = Math.min(a[2], b[2]);
  const y2 = Math.min(a[3], b[3]);

  const intersectionWidth = Math.max(0, x2 - x1);
  const intersectionHeight = Math.max(0, y2 - y1);
  const intersectionArea = intersectionWidth * intersectionHeight;

  const areaA = Math.max(0, a[2] - a[0]) * Math.max(0, a[3] - a[1]);
  const areaB = Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);

  const unionArea = areaA + areaB - intersectionArea;

  if (unionArea <= 0) return 0;

  return intersectionArea / unionArea;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
