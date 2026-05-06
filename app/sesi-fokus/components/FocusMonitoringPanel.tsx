import { PictureInPicture2, TrendingUp, X } from "lucide-react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { getAlertInfo, getDistractionIcon, getFocusIndicators } from "../uiModel";
import type { FocusMonitoringPanelProps } from "../types";

export function FocusMonitoringPanel({
  cameraOn,
  decision,
  faceScores,
  phoneVisible,
  maxPhoneConfidence,
  isCameraPopupSupported,
  isCameraPopupActive,
  onOpenCameraPopup,
  onCloseCameraPopup,
}: FocusMonitoringPanelProps) {
  const alertInfo = getAlertInfo(decision);
  const focusIndicators = getFocusIndicators(
    decision,
    phoneVisible,
    maxPhoneConfidence,
    faceScores,
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#2C3E50]">AI Monitoring</h3>

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
          AI akan memantau fokus belajar kamu secara visual dan memberikan
          gentle reminder jika terdeteksi distraksi.
        </p>

        {cameraOn && isCameraPopupSupported && (
          <div className="mt-4 p-3 bg-[#E3F2FD] border border-[rgba(91,155,213,0.35)] rounded-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <PictureInPicture2 className="w-4 h-4 text-[#5B9BD5]" />
                <p className="text-sm font-medium text-[#2C3E50]">
                  Popup Kamera
                </p>
              </div>

              <Badge variant={isCameraPopupActive ? "info" : "default"}>
                {isCameraPopupActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>

            <p className="text-xs text-[#6B7280] mt-2">
              Saat aktif, kamera tetap tampil di popup kecil ketika kamu
              berpindah tab/aplikasi.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenCameraPopup}
                disabled={isCameraPopupActive}
              >
                Aktifkan Popup
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCloseCameraPopup}
                disabled={!isCameraPopupActive}
              >
                Tutup Popup
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-[#F8FAFB] rounded-xl">
          <p className="text-sm font-semibold text-[#2C3E50]">
            Status: {decision.status}
          </p>
          <p className="text-sm text-[#6B7280] mt-1">{decision.message}</p>
        </div>
      </Card>

      {cameraOn && alertInfo && (
        <Card className={`border-l-4 ${alertInfo.border} ${alertInfo.bg}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div
                className={`p-2 ${alertInfo.iconBg} rounded-lg ${alertInfo.text}`}
              >
                {getDistractionIcon(alertInfo.type, "w-4 h-4")}
              </div>

              <div>
                <h4 className={`font-semibold mb-1 ${alertInfo.text}`}>
                  {alertInfo.title}
                </h4>

                <p className={`text-sm leading-relaxed ${alertInfo.text}`}>
                  {decision.message}
                </p>

                <div className={`text-xs mt-2 space-y-1 ${alertInfo.text}`}>
                  <p>
                    Looking down:{" "}
                    {(decision.signals.lookingDownMs / 1000).toFixed(1)}s
                  </p>
                  <p>
                    Phone visible:{" "}
                    {(decision.signals.phoneVisibleMs / 1000).toFixed(1)}s
                  </p>
                  <p>
                    Phone + looking down:{" "}
                    {(decision.signals.phoneAndLookingDownMs / 1000).toFixed(1)}
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
        <h3 className="font-semibold text-[#2C3E50] mb-4">Indikator Fokus</h3>

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
                      indicator.active ? "text-[#F59E0B]" : "text-[#6B7280]"
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

                <Badge variant={indicator.active ? "warning" : "default"}>
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
            <h4 className="font-semibold text-[#2C3E50] mb-2">Tips Tetap Fokus</h4>

            <ul className="text-sm text-[#6B7280] space-y-1 leading-relaxed">
              <li>Jauhkan HP dari jangkauan.</li>
              <li>Posisi duduk tegak dan nyaman.</li>
              <li>Fokus pada satu tugas.</li>
              <li>Manfaatkan waktu istirahat.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
