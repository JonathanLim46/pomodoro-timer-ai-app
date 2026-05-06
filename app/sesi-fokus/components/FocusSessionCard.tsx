import { Pause, Play, RotateCcw, SkipForward, VideoOff } from "lucide-react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ProgressBar } from "../../components/ProgressBar";
import type { FocusSessionCardProps } from "../types";

export function FocusSessionCard({
  videoRef,
  cameraOn,
  loading,
  ready,
  sessionInfo,
  sessionType,
  timeLeft,
  formatTime,
  progress,
  isRunning,
  onStart,
  onPause,
  onReset,
  onTurnOffCamera,
  onSkipBreak,
}: FocusSessionCardProps) {

  return (
    <>
      <div className="text-center">
        <Badge
          variant={sessionType === "focus" ? "info" : "success"}
          className="text-lg px-6 py-2"
        >
          {sessionInfo.label}
        </Badge>
      </div>

      <Card className="text-center" padding="lg">
        <div className="grid grid-cols-3 mb-8 gap-6">
          <div className="relative col-span-2 flex flex-col">
            <div className="relative w-full max-w-[640px] aspect-[4/3]">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="relative w-full h-full object-cover rounded-2xl shadow-lg bg-black"
              />

              <div
                className={`absolute inset-0 w-full h-full bg-white/70 flex items-center justify-center transition-opacity duration-500 rounded-2xl ${
                  cameraOn ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <p className="font-bold text-[#2C3E50]">
                  Click Start to turn on your camera
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-1 px-4 py-12 flex flex-col text-left">
            <div className="p-4 border-2 flex flex-col text-left rounded-xl">
              <p className="font-bold text-center mb-2">Interpretasi Hasil</p>

              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-bold">Head Down Score tinggi:</span>
                  <p>kepala menunduk</p>
                </li>
                <li>
                  <span className="font-bold">Gaze Down Score tinggi:</span>
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
          className={`w-50 h-20 mx-auto rounded-2xl ${sessionInfo.colorClass} bg-opacity-10 border-8 ${sessionInfo.timerBorderClass} flex items-center justify-center mb-8`}
        >
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {formatTime(timeLeft)}
            </div>

            <div className="text-white">
              {sessionType === "focus" ? "Tetap Fokus!" : "Waktunya Istirahat"}
            </div>
          </div>
        </div>

        <ProgressBar progress={progress} height="lg" className="mb-8" />

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {!isRunning ? (
            <Button
              size="lg"
              className="gap-2 px-12"
              onClick={onStart}
              disabled={!ready || loading}
            >
              <Play className="w-5 h-5" />
              {loading ? "Memuat..." : cameraOn ? "Lanjutkan" : "Mulai"}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 px-12"
              onClick={onPause}
            >
              <Pause className="w-5 h-5" />
              Jeda
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={onReset}
            disabled={!cameraOn}
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2]"
            onClick={onTurnOffCamera}
            disabled={!cameraOn}
          >
            <VideoOff className="w-5 h-5" />
            Turn Off Kamera
          </Button>

          {sessionType !== "focus" && (
            <Button
              variant="ghost"
              size="lg"
              className="gap-2"
              onClick={onSkipBreak}
            >
              <SkipForward className="w-5 h-5" />
              Lewati Istirahat
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}
