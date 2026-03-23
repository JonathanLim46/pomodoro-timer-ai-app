'use client'

import { AlertCircle, Clock, Eye, MousePointer, Pause, Play, RotateCcw, SkipForward, Smartphone, Target, TrendingUp, UserX, X } from "lucide-react";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer"
import { Card } from "../components/Card";
import Navbar from "../components/Navbar";
import { Badge } from "../components/Badge";
import { ProgressBar } from "../components/ProgressBar";
import { Button } from "../components/Button";

export default function SesiFokus() {

    const pomodoro = usePomodoroTimer();

    const sessionLabels = {
        focus: 'Sesi Fokus',
        shortBreak: 'Istirahat Pendek',
        longBreak: 'Istirahat Panjang',
    };

    const sessionColors = {
        focus: 'bg-[#5B9BD5]',
        shortBreak: 'bg-[#4ECDC4]',
        longBreak: 'bg-[#10B981]',
    };

    const getDistractionIcon = (type: string) => {
        switch (type) {
            case 'phone': return <Smartphone className="w-4 h-4" />;
            case 'headDown': return <UserX className="w-4 h-4" />;
            case 'gazeDistraction': return <Eye className="w-4 h-4" />;
            case 'scrolling': return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F8FAFB] to-[#E3F2FD]">
            <Navbar />

            <div className="pt-24 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Main Grid Layout */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="text-center">
                                <Badge
                                    variant={pomodoro.sessionType === 'focus' ? 'info' : 'success'}
                                    className="text-lg px-6 py-2"
                                >
                                    {sessionLabels[pomodoro.sessionType]}
                                </Badge>
                            </div>

                            {/* Timer Display */}
                            <Card className="text-center" padding="lg">
                                <div className={`w-80 h-80 mx-auto rounded-full ${sessionColors[pomodoro.sessionType]} bg-opacity-10 border-8 border-${pomodoro.sessionType === 'focus' ? '[#5B9BD5]' : '[#4ECDC4]'} flex items-center justify-center mb-8`}>
                                    <div>
                                        <div className="text-7xl font-bold text-white mb-2 font-mono">
                                            {pomodoro.formatTime(pomodoro.timeLeft)}
                                        </div>
                                        <div className="text-white">
                                            {pomodoro.sessionType === 'focus' ? 'Tetap Fokus!' : 'Waktunya Istirahat'}
                                        </div>
                                    </div>
                                </div>

                                <ProgressBar
                                    progress={pomodoro.getProgress()}
                                    height="lg"
                                    className="mb-8"
                                />

                                {/* Controls */}
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                    {!pomodoro.isRunning ? (
                                        <Button
                                            size="lg"
                                            className="gap-2 px-12"
                                            onClick={pomodoro.start}
                                        >
                                            <Play className="w-5 h-5" />
                                            Mulai
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
                                        onClick={pomodoro.reset}
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                        Reset
                                    </Button>

                                    {pomodoro.sessionType !== 'focus' && (
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

                        {/* Right Column */}
                        <div className="space-y-6">
                            <Card>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-[#2C3E50]">AI Monitoring</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${true ? 'bg-[#10B981] animate-pulse' : 'bg-[#CBD5E1]'}`} />
                                        <span className="text-sm text-[#6B7280]">
                                            {true ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    AI akan memantau fokus belajar kamu secara visual dan memberikan
                                    gentle reminder jika terdeteksi distraksi.
                                </p>
                            </Card>

                            {true && (
                                <Card className="border-l-4 border-[#F59E0B] bg-[#FFFBEB]">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="p-2 bg-[#FEF3C7] rounded-lg text-[#F59E0B]">
                                                {getDistractionIcon('phone')}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#92400E] mb-1">
                                                    Gentle Reminder
                                                </h4>
                                                <p className="text-sm text-[#92400E] leading-relaxed">
                                                    {'phone'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { }}
                                            className="text-[#92400E] hover:bg-[#FEF3C7] p-1 rounded"
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
                                    {[
                                        { icon: Smartphone, label: 'Phone Detected', type: 'phone' },
                                        { icon: UserX, label: 'Head Down', type: 'headDown' },
                                        { icon: Eye, label: 'Gaze Distraction', type: 'gazeDistraction' },
                                        { icon: MousePointer, label: 'Scrolling Gesture', type: 'scrolling' }
                                    ].map((indicator) => {
                                        const count = 1
                                        const Icon = indicator.icon;

                                        return (
                                            <div key={indicator.type} className="flex items-center justify-between p-3 bg-[#F8FAFB] rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Icon className="w-5 h-5 text-[#6B7280]" />
                                                    <span className="text-sm text-[#2C3E50]">{indicator.label}</span>
                                                </div>
                                                <Badge variant={count > 0 ? 'warning' : 'default'}>
                                                    {count}x
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
        </div>
    );
}