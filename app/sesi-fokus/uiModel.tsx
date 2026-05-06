import { AlertCircle, Eye, MousePointer, Smartphone, UserX } from "lucide-react";
import type { SessionType } from "../hooks/usePomodoroTimer";
import type { FaceScoreState, ProctoringDecision } from "../libs/temporalRules";
import type { AlertInfo, FocusIndicator, SessionInfo } from "./types";

const SESSION_LABELS: Record<SessionType, string> = {
  focus: "Sesi Fokus",
  shortBreak: "Istirahat Pendek",
  longBreak: "Istirahat Panjang",
};

const SESSION_COLORS: Record<SessionType, string> = {
  focus: "bg-[#5B9BD5]",
  shortBreak: "bg-[#4ECDC4]",
  longBreak: "bg-[#10B981]",
};

const TIMER_BORDERS: Record<SessionType, string> = {
  focus: "border-[#5B9BD5]",
  shortBreak: "border-[#4ECDC4]",
  longBreak: "border-[#10B981]",
};

export function getSessionInfo(sessionType: SessionType): SessionInfo {
  return {
    label: SESSION_LABELS[sessionType],
    colorClass: SESSION_COLORS[sessionType],
    timerBorderClass: TIMER_BORDERS[sessionType],
  };
}

export function getAlertInfo(decision: ProctoringDecision): AlertInfo | null {
  switch (decision.status) {
    case "USING_PHONE":
      return {
        title: "Indikasi Menggunakan Handphone",
        type: "phone",
        border: "border-[#EF4444]",
        bg: "bg-[#FEF2F2]",
        iconBg: "bg-[#FEE2E2]",
        text: "text-[#991B1B]",
      };

    case "WARNING_PHONE_VISIBLE":
      return {
        title: "Handphone Terdeteksi",
        type: "phone",
        border: "border-[#F59E0B]",
        bg: "bg-[#FFFBEB]",
        iconBg: "bg-[#FEF3C7]",
        text: "text-[#92400E]",
      };

    case "WARNING_LOOKING_DOWN":
      return {
        title: "Pandangan ke Bawah",
        type: decision.signals.headDown ? "headDown" : "gazeDistraction",
        border: "border-[#F59E0B]",
        bg: "bg-[#FFFBEB]",
        iconBg: "bg-[#FEF3C7]",
        text: "text-[#92400E]",
      };

    case "FACE_MISSING":
      return {
        title: "Wajah Tidak Terdeteksi",
        type: "headDown",
        border: "border-[#EF4444]",
        bg: "bg-[#FEF2F2]",
        iconBg: "bg-[#FEE2E2]",
        text: "text-[#991B1B]",
      };

    default:
      return null;
  }
}

export function getDistractionIcon(
  type: AlertInfo["type"],
  className = "w-4 h-4",
) {
  switch (type) {
    case "phone":
      return <Smartphone className={className} />;
    case "headDown":
      return <UserX className={className} />;
    case "gazeDistraction":
      return <Eye className={className} />;
    case "scrolling":
      return <MousePointer className={className} />;
    default:
      return <AlertCircle className={className} />;
  }
}

export function getFocusIndicators(
  decision: ProctoringDecision,
  phoneVisible: boolean,
  maxPhoneConfidence: number,
  faceScores: FaceScoreState,
): FocusIndicator[] {
  return [
    {
      icon: Smartphone,
      label: "Phone Detected",
      type: "phone",
      active: phoneVisible,
      value: `${maxPhoneConfidence.toFixed(2)}`,
    },
    {
      icon: UserX,
      label: "Head Down",
      type: "headDown",
      active: decision.signals.headDown,
      value: `${faceScores.headDownScore.toFixed(2)}`,
    },
    {
      icon: Eye,
      label: "Gaze Distraction",
      type: "gazeDistraction",
      active: decision.signals.gazeDown,
      value: `${faceScores.gazeDownScore.toFixed(2)}`,
    },
    {
      icon: AlertCircle,
      label: "Scrolling Gesture",
      type: "scrolling",
      active: false,
      value: "-",
    },
  ];
}
