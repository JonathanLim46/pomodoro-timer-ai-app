import { Clock, Target } from "lucide-react";
import { Card } from "../../components/Card";
import type { FocusStatsCardsProps } from "../types";

export function FocusStatsCards({
  completedSessions,
  totalFocusTime,
}: FocusStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="text-center">
        <Clock className="w-8 h-8 text-[#5B9BD5] mx-auto mb-2" />
        <div className="text-2xl font-bold text-[#2C3E50]">{completedSessions}</div>
        <div className="text-sm text-[#6B7280]">Sesi Selesai</div>
      </Card>

      <Card className="text-center">
        <Target className="w-8 h-8 text-[#4ECDC4] mx-auto mb-2" />
        <div className="text-2xl font-bold text-[#2C3E50]">
          {Math.floor(totalFocusTime / 60)}m
        </div>
        <div className="text-sm text-[#6B7280]">Total Fokus</div>
      </Card>
    </div>
  );
}
