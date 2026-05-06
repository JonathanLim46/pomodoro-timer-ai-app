"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";

import { createFaceLandmarker } from "../libs/createFaceLandmarker";
import { computeGazeDownScore, computeHeadDownScore } from "../libs/faceScores";

import {
  FaceScoreState,
  INITIAL_DECISION,
  INITIAL_FACE_SCORES,
  PhoneDetection,
  ProctoringDecision,
  TemporalSmoother,
} from "../libs/temporalRules";

import {
  createYoloPhoneSession,
  detectPhoneFromVideo,
  DEFAULT_YOLO_PHONE_CONFIG,
} from "../libs/yoloPhoneOnnx";

const YOLO_MODEL_URL = "/models/best.onnx";

const MEDIAPIPE_INTERVAL_MS = 100;
const YOLO_INTERVAL_MS = 300;

type PhoneState = {
  detections: PhoneDetection[];
  phoneVisible: boolean;
  maxConfidence: number;
};

type UsingPhoneLevel = 0 | 1 | 2 | 3;

type UsingPhoneWarningReason =
  | "FIRST_DETECTION"
  | "LEVEL_1"
  | "LEVEL_2"
  | "LEVEL_3";

type UsingPhoneWarning = {
  isOpen: boolean;
  level: UsingPhoneLevel;
  count: number;
  reason: UsingPhoneWarningReason | null;
  title: string;
  message: string;
};

const INITIAL_PHONE_STATE: PhoneState = {
  detections: [],
  phoneVisible: false,
  maxConfidence: 0,
};

const INITIAL_USING_PHONE_WARNING: UsingPhoneWarning = {
  isOpen: false,
  level: 0,
  count: 0,
  reason: null,
  title: "",
  message: "",
};

function createWarningPayload(
  reason: UsingPhoneWarningReason,
  level: UsingPhoneLevel,
  count: number,
): UsingPhoneWarning {
  if (reason === "FIRST_DETECTION") {
    return {
      isOpen: false,
      level,
      count,
      reason,
      title: "",
      message: "",
    };
  }

  return {
    isOpen: true,
    level,
    count,
    reason,
    title: `Peringatan USING_PHONE Level ${level}`,
    message: `Status USING_PHONE telah terdeteksi ${count} kali.`,
  };
}

export function useProctoringDetection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const yoloSessionRef = useRef<Awaited<
    ReturnType<typeof createYoloPhoneSession>
  > | null>(null);

  const intervalRef = useRef<number | null>(null);

  const yoloBusyRef = useRef(false);
  const lastYoloTimeRef = useRef(0);
  const lastLogTimeRef = useRef(0);

  const latestPhoneDetectionsRef = useRef<PhoneDetection[]>([]);
  const isUsingPhoneActiveRef = useRef(false);
  const usingPhoneCountRef = useRef(0);
  const usingPhoneLevelRef = useRef<UsingPhoneLevel>(0);

  const temporalSmootherRef = useRef(
    new TemporalSmoother({
      headDownThreshold: 0.58,
      gazeDownThreshold: 0.85,
      phoneConfidenceThreshold: 0.25,

      warningLookDownMs: 2500,
      warningPhoneVisibleMs: 800,

      violationOverlapMs: 1200,
      violationPhoneOnlyMs: 2000,

      faceMissingMs: 3000,
      historyWindowMs: 3000,
    }),
  );

  const [faceScores, setFaceScores] =
    useState<FaceScoreState>(INITIAL_FACE_SCORES);

  const [phoneState, setPhoneState] = useState<PhoneState>(INITIAL_PHONE_STATE);

  const [decision, setDecision] =
    useState<ProctoringDecision>(INITIAL_DECISION);

  const [usingPhoneCount, setUsingPhoneCount] = useState(0);
  const [usingPhoneLevel, setUsingPhoneLevel] = useState<UsingPhoneLevel>(0);
  const [usingPhoneWarning, setUsingPhoneWarning] = useState<UsingPhoneWarning>(
    INITIAL_USING_PHONE_WARNING,
  );
  const [usingPhoneAudioTick, setUsingPhoneAudioTick] = useState(0);

  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  const stopDetectLoop = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetStates = useCallback(() => {
    latestPhoneDetectionsRef.current = [];
    isUsingPhoneActiveRef.current = false;
    usingPhoneCountRef.current = 0;
    usingPhoneLevelRef.current = 0;

    temporalSmootherRef.current.reset();

    setFaceScores(INITIAL_FACE_SCORES);
    setPhoneState(INITIAL_PHONE_STATE);
    setDecision(INITIAL_DECISION);
    setUsingPhoneCount(0);
    setUsingPhoneLevel(0);
    setUsingPhoneWarning(INITIAL_USING_PHONE_WARNING);
    setUsingPhoneAudioTick(0);
  }, []);

  const dismissUsingPhoneWarning = useCallback(() => {
    setUsingPhoneWarning((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const handleUsingPhoneIncident = useCallback(() => {
    const nextCount = usingPhoneCountRef.current + 1;
    usingPhoneCountRef.current = nextCount;
    setUsingPhoneCount(nextCount);

    const shouldPlayAudio =
      nextCount === 1 || nextCount === 5 || nextCount === 10 || nextCount === 15;

    if (shouldPlayAudio) {
      setUsingPhoneAudioTick((prev) => prev + 1);
    }

    if (nextCount === 5) {
      usingPhoneLevelRef.current = 1;
      setUsingPhoneLevel(1);
      setUsingPhoneWarning(createWarningPayload("LEVEL_1", 1, nextCount));
      return;
    }

    if (nextCount === 10) {
      usingPhoneLevelRef.current = 2;
      setUsingPhoneLevel(2);
      setUsingPhoneWarning(createWarningPayload("LEVEL_2", 2, nextCount));
      return;
    }

    if (nextCount === 15) {
      usingPhoneLevelRef.current = 3;
      setUsingPhoneLevel(3);
      setUsingPhoneWarning(createWarningPayload("LEVEL_3", 3, nextCount));
      return;
    }

    setUsingPhoneWarning(
      createWarningPayload(
        "FIRST_DETECTION",
        usingPhoneLevelRef.current,
        nextCount,
      ),
    );
  }, []);

  const stopCamera = useCallback(() => {
    stopDetectLoop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    resetStates();
  }, [resetStates, stopDetectLoop]);

  const detectYoloOnce = useCallback(async () => {
    const video = videoRef.current;
    const yoloSession = yoloSessionRef.current;

    if (!video || !yoloSession) return;
    if (video.readyState < 2) return;
    if (yoloBusyRef.current) return;

    try {
      yoloBusyRef.current = true;

      const detections = await detectPhoneFromVideo(yoloSession, video, {
        ...DEFAULT_YOLO_PHONE_CONFIG,
        inputSize: 768,
        confidenceThreshold: 0.25,
        iouThreshold: 0.45,
      });

      latestPhoneDetectionsRef.current = detections;

      const maxConfidence =
        detections.length > 0
          ? Math.max(...detections.map((det) => det.score))
          : 0;

      setPhoneState({
        detections,
        phoneVisible: detections.length > 0,
        maxConfidence,
      });
    } catch (error) {
      console.error("Gagal menjalankan YOLO ONNX:", error);
    } finally {
      yoloBusyRef.current = false;
    }
  }, []);

  const detectOnce = useCallback(() => {
    const video = videoRef.current;
    const faceLandmarker = faceLandmarkerRef.current;

    if (!video || !faceLandmarker) return;
    if (video.readyState < 2) return;

    const nowMs = performance.now();

    const result = faceLandmarker.detectForVideo(video, nowMs);

    let nextFaceScores: FaceScoreState = INITIAL_FACE_SCORES;

    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
      const landmarks = result.faceLandmarks[0];

      const headDownScore = computeHeadDownScore(landmarks);
      const gazeDownScore = computeGazeDownScore(landmarks);

      nextFaceScores = {
        headDownScore,
        gazeDownScore,
        faceDetected: true,
      };
    }

    setFaceScores(nextFaceScores);

    if (nowMs - lastYoloTimeRef.current >= YOLO_INTERVAL_MS) {
      lastYoloTimeRef.current = nowMs;
      void detectYoloOnce();
    }

    const nextDecision = temporalSmootherRef.current.update({
      nowMs,
      face: nextFaceScores,
      phoneDetections: latestPhoneDetectionsRef.current,
    });

    setDecision(nextDecision);

    const isUsingPhone = nextDecision.status === "USING_PHONE";

    if (isUsingPhone) {
      if (!isUsingPhoneActiveRef.current) {
        isUsingPhoneActiveRef.current = true;
        handleUsingPhoneIncident();
      }
    } else {
      isUsingPhoneActiveRef.current = false;
    }

    if (nowMs - lastLogTimeRef.current > 500) {
      console.log("Proctoring decision:", nextDecision);
      lastLogTimeRef.current = nowMs;
    }
  }, [detectYoloOnce, handleUsingPhoneIncident]);

  const startCamera = useCallback(async () => {
    const video = videoRef.current;
    const faceLandmarker = faceLandmarkerRef.current;
    const yoloSession = yoloSessionRef.current;

    if (!video || !faceLandmarker || !yoloSession) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    streamRef.current = stream;
    video.srcObject = stream;

    await video.play();

    setCameraOn(true);
    resetStates();
    stopDetectLoop();

    intervalRef.current = window.setInterval(() => {
      detectOnce();
    }, MEDIAPIPE_INTERVAL_MS);
  }, [detectOnce, resetStates, stopDetectLoop]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setLoading(true);

        const [faceLandmarker, yoloSession] = await Promise.all([
          createFaceLandmarker(),
          createYoloPhoneSession(YOLO_MODEL_URL),
        ]);

        if (!mounted) {
          faceLandmarker.close();
          return;
        }

        faceLandmarkerRef.current = faceLandmarker;
        yoloSessionRef.current = yoloSession;

        setReady(true);
      } catch (error) {
        console.error("Gagal inisialisasi detector:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;

      stopCamera();

      faceLandmarkerRef.current?.close();
      faceLandmarkerRef.current = null;

      yoloSessionRef.current = null;
    };
  }, [stopCamera]);

  return {
    videoRef,

    faceScores,
    phoneState,
    decision,
    usingPhoneCount,
    usingPhoneLevel,
    usingPhoneWarning,
    usingPhoneAudioTick,

    loading,
    ready,
    cameraOn,

    startCamera,
    stopCamera,
    dismissUsingPhoneWarning,
  };
}
