export type FaceScoreState = {
  headDownScore: number;
  gazeDownScore: number;
  faceDetected: boolean;
};

export type PhoneDetection = {
  bbox: [number, number, number, number]; // x1, y1, x2, y2
  score: number;
  className: "handphone";
  areaRatio: number;
};

export type ProctoringStatus =
  | "NORMAL"
  | "WARNING_LOOKING_DOWN"
  | "WARNING_PHONE_VISIBLE"
  | "USING_PHONE"
  | "FACE_MISSING";

export type ProctoringDecision = {
  status: ProctoringStatus;
  message: string;
  signals: {
    faceDetected: boolean;
    headDown: boolean;
    gazeDown: boolean;
    lookingDown: boolean;
    phoneVisible: boolean;
    maxPhoneConfidence: number;
    lookingDownMs: number;
    phoneVisibleMs: number;
    phoneAndLookingDownMs: number;
    faceMissingMs: number;
  };
};

type TemporalFrame = {
  t: number;
  faceDetected: boolean;
  headDown: boolean;
  gazeDown: boolean;
  lookingDown: boolean;
  phoneVisible: boolean;
  maxPhoneConfidence: number;
};

export type TemporalRuleConfig = {
  historyWindowMs: number;
  headDownThreshold: number;
  gazeDownThreshold: number;
  phoneConfidenceThreshold: number;
  phoneAreaRatioThreshold: number;
  warningLookDownMs: number;
  warningPhoneVisibleMs: number;
  violationOverlapMs: number;
  violationPhoneOnlyMs: number;
  faceMissingMs: number;
};

export const DEFAULT_TEMPORAL_RULE_CONFIG: TemporalRuleConfig = {
  historyWindowMs: 3000,

  headDownThreshold: 0.58,
  gazeDownThreshold: 0.85,

  phoneConfidenceThreshold: 0.25,
  phoneAreaRatioThreshold: 0.005,

  warningLookDownMs: 2500,
  warningPhoneVisibleMs: 800,

  violationOverlapMs: 1200,
  violationPhoneOnlyMs: 2000,

  faceMissingMs: 3000,
};

export const INITIAL_FACE_SCORES: FaceScoreState = {
  headDownScore: 0,
  gazeDownScore: 0,
  faceDetected: false,
};

export const INITIAL_DECISION: ProctoringDecision = {
  status: "NORMAL",
  message: "Normal",
  signals: {
    faceDetected: false,
    headDown: false,
    gazeDown: false,
    lookingDown: false,
    phoneVisible: false,
    maxPhoneConfidence: 0,
    lookingDownMs: 0,
    phoneVisibleMs: 0,
    phoneAndLookingDownMs: 0,
    faceMissingMs: 0,
  },
};

export class TemporalSmoother {
  private history: TemporalFrame[] = [];
  private config: TemporalRuleConfig;

  constructor(config: Partial<TemporalRuleConfig> = {}) {
    this.config = {
      ...DEFAULT_TEMPORAL_RULE_CONFIG,
      ...config,
    };
  }

  reset() {
    this.history = [];
  }

  update(params: {
    nowMs: number;
    face: FaceScoreState;
    phoneDetections: PhoneDetection[];
  }): ProctoringDecision {
    const { nowMs, face, phoneDetections } = params;

    const validPhoneDetections = phoneDetections
      .filter((det) => {
        return (
          det.score >= this.config.phoneConfidenceThreshold &&
          det.areaRatio >= this.config.phoneAreaRatioThreshold
        );
      })
      .sort((a, b) => b.score - a.score);

    const bestPhone = validPhoneDetections[0] ?? null;

    const headDown =
      face.faceDetected && face.headDownScore >= this.config.headDownThreshold;

    const gazeDown =
      face.faceDetected && face.gazeDownScore >= this.config.gazeDownThreshold;

    const lookingDown = headDown || gazeDown;
    const phoneVisible = Boolean(bestPhone);

    const frame: TemporalFrame = {
      t: nowMs,
      faceDetected: face.faceDetected,
      headDown,
      gazeDown,
      lookingDown,
      phoneVisible,
      maxPhoneConfidence: bestPhone?.score ?? 0,
    };

    this.history.push(frame);
    this.prune(nowMs);

    const lookingDownMs = this.continuousDuration(nowMs, (f) => f.lookingDown);

    const phoneVisibleMs = this.continuousDuration(
      nowMs,
      (f) => f.phoneVisible,
    );

    const faceMissingMs = this.continuousDuration(
      nowMs,
      (f) => !f.faceDetected,
    );

    const phoneAndLookingDownMs = this.rollingDuration(
      nowMs,
      this.config.historyWindowMs,
      (f) => f.phoneVisible && f.lookingDown,
    );

    let status: ProctoringStatus = "NORMAL";
    let message = "Normal";

    if (phoneAndLookingDownMs >= this.config.violationOverlapMs) {
      status = "USING_PHONE";
      message =
        "Indikasi menggunakan handphone: handphone terdeteksi bersamaan dengan kepala/pandangan ke bawah.";
    } else if (phoneVisibleMs >= this.config.violationPhoneOnlyMs) {
      status = "USING_PHONE";
      message =
        "Indikasi menggunakan handphone: handphone terlihat cukup lama.";
    } else if (faceMissingMs >= this.config.faceMissingMs) {
      status = "FACE_MISSING";
      message = "Wajah tidak terdeteksi cukup lama.";
    } else if (phoneVisibleMs >= this.config.warningPhoneVisibleMs) {
      status = "WARNING_PHONE_VISIBLE";
      message = "Handphone mulai terdeteksi. Menunggu konfirmasi temporal.";
    } else if (lookingDownMs >= this.config.warningLookDownMs) {
      status = "WARNING_LOOKING_DOWN";
      message = "Kepala atau pandangan mengarah ke bawah cukup lama.";
    }

    return {
      status,
      message,
      signals: {
        faceDetected: frame.faceDetected,
        headDown: frame.headDown,
        gazeDown: frame.gazeDown,
        lookingDown: frame.lookingDown,
        phoneVisible: frame.phoneVisible,
        maxPhoneConfidence: frame.maxPhoneConfidence,
        lookingDownMs,
        phoneVisibleMs,
        phoneAndLookingDownMs,
        faceMissingMs,
      },
    };
  }

  private prune(nowMs: number) {
    const maxNeededMs = Math.max(
      this.config.historyWindowMs,
      this.config.warningLookDownMs,
      this.config.violationPhoneOnlyMs,
      this.config.faceMissingMs,
    );

    const minTime = nowMs - maxNeededMs - 1000;
    this.history = this.history.filter((frame) => frame.t >= minTime);
  }

  private continuousDuration(
    nowMs: number,
    predicate: (frame: TemporalFrame) => boolean,
  ): number {
    let duration = 0;
    let cursor = nowMs;

    for (let i = this.history.length - 1; i >= 0; i--) {
      const frame = this.history[i];

      if (!predicate(frame)) break;

      duration += Math.max(0, cursor - frame.t);
      cursor = frame.t;
    }

    return duration;
  }

  private rollingDuration(
    nowMs: number,
    windowMs: number,
    predicate: (frame: TemporalFrame) => boolean,
  ): number {
    const startMs = nowMs - windowMs;

    const frames = this.history.filter((frame) => frame.t >= startMs);

    let duration = 0;

    for (let i = 0; i < frames.length - 1; i++) {
      const current = frames[i];
      const next = frames[i + 1];

      if (predicate(current)) {
        duration += Math.max(0, next.t - current.t);
      }
    }

    return duration;
  }
}
