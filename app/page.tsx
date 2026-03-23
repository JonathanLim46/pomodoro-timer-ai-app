'use client'

import Link from 'next/link';
import { Eye, Clock, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { Button } from './components/Button';
import { Card } from './components/Card';
import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFB] to-[#E3F2FD]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[rgba(91,155,213,0.2)] mb-6">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            <span className="text-sm text-[#6B7280]">Platform Fokus Belajar dengan AI</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-[#2C3E50] mb-6 leading-tight">
            Tingkatkan Fokus Belajar<br />
            dengan <span className="text-[#5B9BD5]">Pomodoro & AI</span>
          </h1>

          <p className="text-xl text-[#6B7280] mb-10 max-w-2xl mx-auto leading-relaxed">
            Project M membantu mahasiswa dan pelajar tetap fokus selama sesi belajar online
            dengan timer Pomodoro dan monitoring AI yang supportive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/sesi-fokus">
              <Button size="lg" className="gap-2 group">
                Mulai Fokus Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            {/* <Button variant="outline" size="lg" className="gap-2">
              <Eye className="w-5 h-5" />
              Lihat Demo
            </Button> */}
          </div>

          {/* Hero Image/Mockup */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl border border-[rgba(91,155,213,0.15)] p-8 mx-auto max-w-4xl">
              <div className="aspect-video bg-gradient-to-br from-[#E3F2FD] to-[#F0F4F7] rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Clock className="w-24 h-24 text-[#5B9BD5] mx-auto mb-4 opacity-50" />
                  <p className="text-[#6B7280]">Interface Pomodoro Timer</p>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-8 left-8 bg-white px-4 py-3 rounded-xl shadow-lg border border-[rgba(91,155,213,0.15)] hidden md:block">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#10B981] rounded-full" />
                <span className="text-sm text-[#2C3E50]">Fokus Terdeteksi</span>
              </div>
            </div>
            <div className="absolute -bottom-8 right-8 bg-white px-4 py-3 rounded-xl shadow-lg border border-[rgba(91,155,213,0.15)] hidden md:block">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm text-[#2C3E50]">Selesaikan Jumlah Sesi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Fitur Utama</h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Semua yang kamu butuhkan untuk menjaga fokus dan produktivitas belajar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <div className="p-3 bg-gradient-to-br from-[#5B9BD5] to-[#4ECDC4] rounded-xl w-fit mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Pomodoro Timer</h3>
              <p className="text-[#6B7280] leading-relaxed">
                Teknik Pomodoro klasik dengan durasi 25 menit fokus dan 5 menit istirahat,
                membantu kamu tetap produktif tanpa burnout.
              </p>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300">
              <div className="p-3 bg-gradient-to-br from-[#4ECDC4] to-[#5B9BD5] rounded-xl w-fit mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">AI Focus Detection</h3>
              <p className="text-[#6B7280] leading-relaxed">
                Monitoring visual yang mendeteksi distraksi seperti melihat HP,
                menunduk terlalu lama, atau scrolling berlebihan.
              </p>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300">
              <div className="p-3 bg-gradient-to-br from-[#10B981] to-[#4ECDC4] rounded-xl w-fit mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Smart Analytics</h3>
              <p className="text-[#6B7280] leading-relaxed">
                Lihat statistik fokus, jumlah distraksi, dan persentase produktivitas
                untuk evaluasi diri yang lebih baik.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#F8FAFB] to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Cara Kerja</h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Mulai fokus belajar hanya dalam 3 langkah sederhana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#5B9BD5] to-[#4ECDC4] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Mulai Sesi</h3>
              <p className="text-[#6B7280] leading-relaxed">
                Klik "Mulai Fokus" dan timer Pomodoro 25 menit akan berjalan.
                Tidak perlu login atau setup rumit.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4ECDC4] to-[#10B981] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Fokus Belajar</h3>
              <p className="text-[#6B7280] leading-relaxed">
                AI monitoring akan memantau fokus kamu secara visual.
                Jika terdistraksi, akan ada gentle reminder untuk kembali fokus.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#5B9BD5] rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Lihat Hasil</h3>
              <p className="text-[#6B7280] leading-relaxed">
                Setelah sesi selesai, lihat ringkasan fokus, distraksi yang terdeteksi,
                dan statistik produktivitas kamu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#5B9BD5] to-[#4ECDC4]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Siap Meningkatkan Fokus Belajar?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Mulai sesi Pomodoro pertama kamu sekarang. Gratis, tanpa daftar,
            langsung pakai!
          </p>
          <Link href="/sesi-fokus">
            <Button
              size="lg"
              className="bg-[#5B9BD5] text-[#5B9BD5] hover:text-[#5B9BD5] hover:bg-[#E3F2FD] shadow-xl gap-2 group"
            >
              Mulai Sesi Fokus
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#2C3E50] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold">Project M</h3>
                <p className="text-sm text-white/70">AI-Powered Study Timer</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-white/70">
                Created with Love
              </p>
              <p className="text-xs text-white/50 mt-1">
                Platform fokus belajar yang tenang, supportive, dan efektif.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
