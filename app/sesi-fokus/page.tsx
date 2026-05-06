"use client";

import { useEffect, useRef } from "react";

import {
  AlertCircle,
  Clock,
  Eye,
  MousePointer,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Smartphone,
  Target,
  TrendingUp,
  UserX,
  X,
} from "lucide-react";

import { usePomodoroTimer } from "../hooks/usePomodoroTimer";
import { useProctoringDetection } from "../hooks/useProctoringDetection";

import { Card } from "../components/Card";
import Navbar from "../components/Navbar";
import { Badge } from "../components/Badge";
import { ProgressBar } from "../components/ProgressBar";
import { Button } from "../components/Button";
import { UsingPhoneWarningModal } from "../components/UsingPhoneWarningModal";

export default function SesiFokus() {
  const {
    videoRef,
    faceScores,
    phoneState,
    decision,
    loading,
    ready,
    cameraOn,
    startCamera,
    stopCamera,
    usingPhoneWarning,
    usingPhoneAudioTick,
    dismissUsingPhoneWarning,
  } = useProctoringDetection();

  const pomodoro = usePomodoroTimer();
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const pausePomodoro = pomodoro.pause;
  const isPomodoroRunning = pomodoro.isRunning;

  const sessionLabels = {
    focus: "Sesi Fokus",
    shortBreak: "Istirahat Pendek",
    longBreak: "Istirahat Panjang",
  };

  const sessionColors = {
    focus: "bg-[#5B9BD5]",
    shortBreak: "bg-[#4ECDC4]",
    longBreak: "bg-[#10B981]",
  };

  const timerBorderClass =
    pomodoro.sessionType === "focus"
      ? "border-[#5B9BD5]"
      : pomodoro.sessionType === "shortBreak"
        ? "border-[#4ECDC4]"
        : "border-[#10B981]";

  const getDistractionIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Smartphone className="w-4 h-4" />;
      case "headDown":
        return <UserX className="w-4 h-4" />;
      case "gazeDistraction":
        return <Eye className="w-4 h-4" />;
      case "scrolling":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAlertInfo = () => {
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
  };

  const alertInfo = getAlertInfo();

  const focusIndicators = [
    {
      icon: Smartphone,
      label: "Phone Detected",
      type: "phone",
      active: phoneState.phoneVisible,
      value: `${phoneState.maxConfidence.toFixed(2)}`,
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
      icon: MousePointer,
      label: "Scrolling Gesture",
      type: "scrolling",
      active: false,
      value: "-",
    },
  ];

  const handleStart = async () => {
    await startCamera();
    pomodoro.start();
  };

  const handleStop = async () => {
    stopCamera();
    pomodoro.reset();
  };

  const handleWarningPause = () => {
    pausePomodoro();
    dismissUsingPhoneWarning();
  };

  useEffect(() => {
    if (usingPhoneAudioTick === 0) return;

    if (!alertAudioRef.current) {
      alertAudioRef.current = new Audio("/audio/hidup-jokowi.mp3");
      alertAudioRef.current.preload = "auto";
    }

    const player = alertAudioRef.current;
    player.currentTime = 0;

    void player.play().catch((error) => {
      console.warn("Audio peringatan tidak dapat diputar:", error);
    });
  }, [usingPhoneAudioTick]);

  useEffect(() => {
    if (usingPhoneWarning.isOpen && isPomodoroRunning) {
      pausePomodoro();
    }
  }, [usingPhoneWarning.isOpen, isPomodoroRunning, pausePomodoro]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFB] to-[#E3F2FD]">
      <Navbar />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="text-center">
                <Badge
                  variant={
                    pomodoro.sessionType === "focus" ? "info" : "success"
                  }
                  className="text-lg px-6 py-2"
                >
                  {sessionLabels[pomodoro.sessionType]}
                </Badge>
              </div>

              <Card className="text-center" padding="lg">
                <div className="grid grid-cols-3 mb-8 gap-6">
                  <div className="relative col-span-2 flex flex-col">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="relative w-full h-full max-w-[640px] rounded-2xl shadow-lg bg-black"
                    />

                    <div
                      className={`absolute inset-0 w-full h-full bg-white/70 flex items-center justify-center transition-opacity duration-500 rounded-2xl ${
                        cameraOn
                          ? "opacity-0 pointer-events-none"
                          : "opacity-100"
                      }`}
                    >
                      <p className="font-bold text-[#2C3E50]">
                        Click Start to turn on your camera
                      </p>
                    </div>
                  </div>

                  <div className="col-span-1 px-4 py-12 flex flex-col text-left">
                    <div className="p-4 border-2 flex flex-col text-left rounded-xl">
                      <p className="font-bold text-center mb-2">
                        Interpretasi Hasil
                      </p>

                      <ul className="space-y-2 text-sm">
                        <li>
                          <span className="font-bold">
                            Head Down Score tinggi:
                          </span>
                          <p>kepala menunduk</p>
                        </li>
                        <li>
                          <span className="font-bold">
                            Gaze Down Score tinggi:
                          </span>
                          <p>arah pandang ke bawah</p>
                        </li>
                        <li>
                          <span className="font-bold">Phone Visible true</span>
                          <p>handphone terdeteksi YOLO</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-50 h-20 mx-auto rounded-2xl ${sessionColors[pomodoro.sessionType]} bg-opacity-10 border-8 ${timerBorderClass} flex items-center justify-center mb-8`}
                >
                  <div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {pomodoro.formatTime(pomodoro.timeLeft)}
                    </div>

                    <div className="text-white">
                      {pomodoro.sessionType === "focus"
                        ? "Tetap Fokus!"
                        : "Waktunya Istirahat"}
                    </div>
                  </div>
                </div>

                <ProgressBar
                  progress={pomodoro.getProgress()}
                  height="lg"
                  className="mb-8"
                />

                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {!pomodoro.isRunning ? (
                    <Button
                      size="lg"
                      className="gap-2 px-12"
                      onClick={handleStart}
                      disabled={!ready || loading || cameraOn}
                    >
                      <Play className="w-5 h-5" />
                      {loading ? "Memuat..." : "Mulai"}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="secondary"
                      className="gap-2 px-12"
                      onClick={pomodoro.pause}
                    >
                      <Pause className="w-5 h-5" />
                      Jeda
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={handleStop}
                    disabled={!cameraOn}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </Button>

                  {pomodoro.sessionType !== "focus" && (
                    <Button
                      variant="ghost"
                      size="lg"
                      className="gap-2"
                      onClick={pomodoro.skipBreak}
                    >
                      <SkipForward className="w-5 h-5" />
                      Lewati Istirahat
                    </Button>
                  )}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center">
                  <Clock className="w-8 h-8 text-[#5B9BD5] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#2C3E50]">
                    {pomodoro.completedSessions}
                  </div>
                  <div className="text-sm text-[#6B7280]">Sesi Selesai</div>
                </Card>

                <Card className="text-center">
                  <Target className="w-8 h-8 text-[#4ECDC4] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#2C3E50]">
                    {Math.floor(pomodoro.totalFocusTime / 60)}m
                  </div>
                  <div className="text-sm text-[#6B7280]">Total Fokus</div>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#2C3E50]">
                    AI Monitoring
                  </h3>

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        cameraOn ? "bg-[#10B981] animate-pulse" : "bg-[#CBD5E1]"
                      }`}
                    />

                    <span className="text-sm text-[#6B7280]">
                      {cameraOn ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#6B7280] leading-relaxed">
                  AI akan memantau fokus belajar kamu secara visual dan
                  memberikan gentle reminder jika terdeteksi distraksi.
                </p>

                <div className="mt-4 p-3 bg-[#F8FAFB] rounded-xl">
                  <p className="text-sm font-semibold text-[#2C3E50]">
                    Status: {decision.status}
                  </p>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {decision.message}
                  </p>
                </div>
              </Card>

              {cameraOn && alertInfo && (
                <Card
                  className={`border-l-4 ${alertInfo.border} ${alertInfo.bg}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`p-2 ${alertInfo.iconBg} rounded-lg ${alertInfo.text}`}
                      >
                        {getDistractionIcon(alertInfo.type)}
                      </div>

                      <div>
                        <h4 className={`font-semibold mb-1 ${alertInfo.text}`}>
                          {alertInfo.title}
                        </h4>

                        <p
                          className={`text-sm leading-relaxed ${alertInfo.text}`}
                        >
                          {decision.message}
                        </p>

                        <div
                          className={`text-xs mt-2 space-y-1 ${alertInfo.text}`}
                        >
                          <p>
                            Looking down:{" "}
                            {(decision.signals.lookingDownMs / 1000).toFixed(1)}
                            s
                          </p>
                          <p>
                            Phone visible:{" "}
                            {(decision.signals.phoneVisibleMs / 1000).toFixed(
                              1,
                            )}
                            s
                          </p>
                          <p>
                            Phone + looking down:{" "}
                            {(
                              decision.signals.phoneAndLookingDownMs / 1000
                            ).toFixed(1)}
                            s
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {}}
                      className={`${alertInfo.text} hover:bg-white/50 p-1 rounded`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              )}

              <Card>
                <h3 className="font-semibold text-[#2C3E50] mb-4">
                  Indikator Fokus
                </h3>

                <div className="space-y-3">
                  {focusIndicators.map((indicator) => {
                    const Icon = indicator.icon;

                    return (
                      <div
                        key={indicator.type}
                        className="flex items-center justify-between p-3 bg-[#F8FAFB] rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-5 h-5 ${
                              indicator.active
                                ? "text-[#F59E0B]"
                                : "text-[#6B7280]"
                            }`}
                          />
                          <div>
                            <span className="text-sm text-[#2C3E50] block">
                              {indicator.label}
                            </span>
                            <span className="text-xs text-[#6B7280]">
                              Nilai: {indicator.value}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={indicator.active ? "warning" : "default"}
                        >
                          {indicator.active ? "Aktif" : "Normal"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-[#E3F2FD] to-[#F0F4F7] border-[#5B9BD5]">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[#5B9BD5]" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#2C3E50] mb-2">
                      Tips Tetap Fokus
                    </h4>

                    <ul className="text-sm text-[#6B7280] space-y-1 leading-relaxed">
                      <li>• Jauhkan HP dari jangkauan</li>
                      <li>• Posisi duduk tegak dan nyaman</li>
                      <li>• Fokus pada satu tugas</li>
                      <li>• Manfaatkan waktu istirahat</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <UsingPhoneWarningModal
        open={usingPhoneWarning.isOpen}
        level={usingPhoneWarning.level}
        count={usingPhoneWarning.count}
        onPause={handleWarningPause}
        onClose={dismissUsingPhoneWarning}
      />
    </div>
  );
}
