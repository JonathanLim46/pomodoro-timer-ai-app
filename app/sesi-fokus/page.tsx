"use client";

import { useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { UsingPhoneWarningModal } from "../components/UsingPhoneWarningModal";
import { useCameraPopup } from "../hooks/useCameraPopup";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer";
import { useProctoringDetection } from "../hooks/useProctoringDetection";
import { FocusMonitoringPanel } from "./components/FocusMonitoringPanel";
import { FocusSessionCard } from "./components/FocusSessionCard";
import { FocusStatsCards } from "./components/FocusStatsCards";
import { getSessionInfo } from "./uiModel";

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

  const {
    isCameraPopupSupported,
    isCameraPopupActive,
    openCameraPopup,
    closeCameraPopup,
  } = useCameraPopup({
    videoRef,
    enabled: cameraOn,
  });

  const sessionInfo = getSessionInfo(pomodoro.sessionType);

  const handleStart = async () => {
    if (!cameraOn) {
      await startCamera();
    }
    pomodoro.start();
    void openCameraPopup();
  };

  const handleStop = async () => {
    stopCamera();
    pomodoro.reset();
  };

  const handleTurnOffCamera = () => {
    stopCamera();
  };

  const handleWarningPause = () => {
    pausePomodoro();
    dismissUsingPhoneWarning();
  };

  // Memutar audio peringatan setiap kali counter warning bertambah.
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

  // Menjeda Pomodoro secara otomatis ketika modal warning USING_PHONE terbuka.
  useEffect(() => {
    if (usingPhoneWarning.isOpen && isPomodoroRunning) {
      pausePomodoro();
    }
  }, [usingPhoneWarning.isOpen, isPomodoroRunning, pausePomodoro]);

  // Menutup camera popup jika kamera utama dimatikan.
  useEffect(() => {
    if (!cameraOn) {
      void closeCameraPopup();
    }
  }, [cameraOn, closeCameraPopup]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFB] to-[#E3F2FD]">
      <Navbar />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <FocusSessionCard
                videoRef={videoRef}
                cameraOn={cameraOn}
                loading={loading}
                ready={ready}
                sessionInfo={sessionInfo}
                sessionType={pomodoro.sessionType}
                timeLeft={pomodoro.timeLeft}
                formatTime={pomodoro.formatTime}
                progress={pomodoro.getProgress()}
                isRunning={pomodoro.isRunning}
                onStart={handleStart}
                onPause={pomodoro.pause}
                onReset={handleStop}
                onTurnOffCamera={handleTurnOffCamera}
                onSkipBreak={pomodoro.skipBreak}
              />

              <FocusStatsCards
                completedSessions={pomodoro.completedSessions}
                totalFocusTime={pomodoro.totalFocusTime}
              />
            </div>

            <FocusMonitoringPanel
              cameraOn={cameraOn}
              decision={decision}
              faceScores={faceScores}
              phoneVisible={phoneState.phoneVisible}
              maxPhoneConfidence={phoneState.maxConfidence}
              isCameraPopupSupported={isCameraPopupSupported}
              isCameraPopupActive={isCameraPopupActive}
              onOpenCameraPopup={openCameraPopup}
              onCloseCameraPopup={closeCameraPopup}
            />
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
