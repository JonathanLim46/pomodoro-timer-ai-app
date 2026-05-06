import type { RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import type { SessionType } from "../hooks/usePomodoroTimer";
import type { FaceScoreState, ProctoringDecision } from "../libs/temporalRules";

export type SessionInfo = {
  label: string;
  colorClass: string;
  timerBorderClass: string;
};

export type AlertInfo = {
  title: string;
  type: "phone" | "headDown" | "gazeDistraction" | "scrolling";
  border: string;
  bg: string;
  iconBg: string;
  text: string;
};

export type FocusIndicator = {
  icon: LucideIcon;
  label: string;
  type: "phone" | "headDown" | "gazeDistraction" | "scrolling";
  active: boolean;
  value: string;
};

export type FocusSessionCardProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraOn: boolean;
  loading: boolean;
  ready: boolean;
  sessionInfo: SessionInfo;
  sessionType: SessionType;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  progress: number;
  isRunning: boolean;
  onStart: () => void | Promise<void>;
  onPause: () => void;
  onReset: () => void | Promise<void>;
  onTurnOffCamera: () => void | Promise<void>;
  onSkipBreak: () => void;
};

export type FocusStatsCardsProps = {
  completedSessions: number;
  totalFocusTime: number;
};

export type FocusMonitoringPanelProps = {
  cameraOn: boolean;
  decision: ProctoringDecision;
  faceScores: FaceScoreState;
  phoneVisible: boolean;
  maxPhoneConfidence: number;
  isCameraPopupSupported: boolean;
  isCameraPopupActive: boolean;
  onOpenCameraPopup: () => void | Promise<void | boolean>;
  onCloseCameraPopup: () => void | Promise<void>;
};
