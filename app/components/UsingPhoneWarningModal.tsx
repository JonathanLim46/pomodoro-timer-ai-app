import { AlertTriangle, Smartphone } from "lucide-react";

import { Button } from "./Button";

type UsingPhoneWarningModalProps = {
  open: boolean;
  level: 0 | 1 | 2 | 3;
  count: number;
  onPause: () => void;
  onClose: () => void;
};

const levelColors = {
  1: {
    border: "border-[#F59E0B]",
    bg: "bg-[#FFFBEB]",
    badge: "bg-[#FEF3C7] text-[#92400E]",
    title: "text-[#92400E]",
  },
  2: {
    border: "border-[#EF4444]",
    bg: "bg-[#FEF2F2]",
    badge: "bg-[#FEE2E2] text-[#991B1B]",
    title: "text-[#991B1B]",
  },
  3: {
    border: "border-[#DC2626]",
    bg: "bg-[#FEE2E2]",
    badge: "bg-[#FECACA] text-[#7F1D1D]",
    title: "text-[#7F1D1D]",
  },
} as const;

export function UsingPhoneWarningModal({
  open,
  level,
  count,
  onPause,
  onClose,
}: UsingPhoneWarningModalProps) {
  if (!open) return null;

  const safeLevel = level === 0 ? 1 : level;
  const color = levelColors[safeLevel];

  return (
    <div className="fixed inset-0 z-50 bg-[#2C3E50]/45 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-md rounded-2xl border-2 shadow-2xl ${color.border} ${color.bg} p-6`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <Smartphone className={`w-5 h-5 ${color.title}`} />
          </div>
          <div>
            <p className={`font-semibold ${color.title}`}>
              Peringatan USING_PHONE
            </p>
            <p className="text-sm text-[#2C3E50]">Deteksi ke-{count}</p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${color.badge}`}>
          <AlertTriangle className="w-4 h-4" />
          Level {safeLevel}
        </div>

        <p className="text-sm text-[#2C3E50] mt-4 leading-relaxed">
          Sistem mendeteksi indikasi penggunaan handphone berulang. Timer akan
          dijeda agar sesi fokus bisa dikendalikan kembali.
        </p>

        <div className="mt-6 flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Tutup
          </Button>
          <Button variant="secondary" onClick={onPause}>
            Pause Timer
          </Button>
        </div>
      </div>
    </div>
  );
}
