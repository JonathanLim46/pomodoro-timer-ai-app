# Project M App

Project M App adalah aplikasi web berbasis Next.js untuk sesi belajar fokus dengan kombinasi:

- Pomodoro timer
- deteksi handphone menggunakan YOLO ONNX
- deteksi arah kepala dan pandangan menggunakan MediaPipe Face Landmarker
- rule temporal untuk menentukan status fokus, warning, dan violation

Project ini dirancang sebagai platform belajar yang lebih terarah, supportive, dan mudah dievaluasi lewat statistik sesi fokus.

## Teknologi

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- `lucide-react` untuk ikon
- `onnxruntime-web` untuk inference YOLO
- `@mediapipe/tasks-vision` untuk Face Landmarker

## Fitur Utama

- Landing page dengan CTA menuju sesi fokus
- Halaman `sesi-fokus` dengan timer Pomodoro
- Kamera aktif untuk monitoring visual
- Deteksi handphone melalui model YOLO
- Deteksi head down dan gaze down melalui MediaPipe
- Popup kamera saat tab/aplikasi berpindah
- Peringatan bertingkat ketika pola penggunaan handphone terdeteksi
- Statistik sesi selesai dan total fokus

## Arsitektur Project

- `app/page.tsx` - landing page utama
- `app/sesi-fokus/page.tsx` - halaman sesi fokus
- `app/hooks/usePomodoroTimer.ts` - logika timer Pomodoro
- `app/hooks/useProctoringDetection.ts` - logika kamera, YOLO, MediaPipe, dan decision engine
- `app/hooks/useCameraPopup.ts` - kontrol Picture-in-Picture kamera
- `app/libs/yoloPhoneOnnx.ts` - inference model YOLO untuk deteksi handphone
- `app/libs/createFaceLandmarker.ts` - inisialisasi MediaPipe Face Landmarker
- `app/libs/faceScores.ts` - heuristik perhitungan skor head down dan gaze down
- `app/libs/temporalRules.ts` - rule temporal untuk status proctoring
- `app/components/*` - komponen UI reusable
- `app/sesi-fokus/components/*` - komponen khusus halaman sesi fokus

## Analisis Singkat

- Aplikasi memakai Next.js App Router dengan dua route utama: `/` untuk landing page dan `/sesi-fokus` untuk ruang belajar fokus.
- Halaman fokus berjalan sebagai Client Component karena butuh akses kamera, audio, timer, dan browser API.
- `useProctoringDetection` menjadi orkestrator utama untuk inisialisasi model, start/stop kamera, loop deteksi, dan penyimpanan status UI.
- Sinyal mentah dari MediaPipe dan YOLO tidak dipakai langsung sebagai alert; `TemporalSmoother` menambahkan lapisan temporal supaya peringatan lebih stabil.
- `usePomodoroTimer` mengatur siklus fokus dan istirahat sekaligus statistik sesi yang tampil di dashboard.

## Perhitungan Timer Pomodoro

Timer Pomodoro di project ini memakai pola klasik yang diimplementasikan langsung di `app/hooks/usePomodoroTimer.ts`.

### Durasi Sesi

| Sesi | Durasi | Keterangan |
| --- | ---: | --- |
| `focus` | `25 menit` | Sesi belajar utama |
| `shortBreak` | `5 menit` | Istirahat singkat setelah fokus |
| `longBreak` | `15 menit` | Istirahat panjang setelah 4 sesi fokus |

### Aturan Perpindahan Sesi

1. Saat user menekan mulai, `timeLeft` berjalan mundur 1 detik per tick.
2. Jika `timeLeft` mencapai `0`, sesi dianggap selesai.
3. Jika sesi yang selesai adalah `focus`, maka `completedSessions` bertambah `1`.
4. Setelah sesi `focus` selesai:
   - jika jumlah sesi fokus yang sudah selesai bukan kelipatan 4, timer pindah ke `shortBreak`
   - jika kelipatan 4, timer pindah ke `longBreak`
5. Jika sesi yang selesai adalah `shortBreak` atau `longBreak`, timer kembali ke `focus`.
6. `totalFocusTime` hanya bertambah ketika sesi `focus` selesai.

### Rumus Yang Dipakai

- `progress = ((totalDuration - timeLeft) / totalDuration) * 100`
- `totalDuration` mengikuti `sessionType` aktif:
  - `focus = 25 * 60`
  - `shortBreak = 5 * 60`
  - `longBreak = 15 * 60`

### State Yang Ditampilkan

- `timeLeft` - sisa waktu sesi aktif
- `isRunning` - status timer berjalan atau dijeda
- `sessionType` - jenis sesi aktif
- `completedSessions` - jumlah sesi fokus yang sudah selesai
- `totalFocusTime` - total waktu fokus yang berhasil diselesaikan

### Aksi Tambahan

- `pause()` menghentikan timer sementara.
- `reset()` mengembalikan `timeLeft` ke durasi sesi aktif saat itu.
- `skipBreak()` langsung mengembalikan sesi ke `focus`.

## Alur Kerja

1. User membuka halaman `/`.
2. User masuk ke `/sesi-fokus` lewat CTA.
3. Halaman fokus menginisialisasi Pomodoro, kamera popup, dan sistem proctoring.
4. Model Face Landmarker dan YOLO dimuat secara async sampai status `ready`.
5. Saat user menekan mulai, kamera aktif, timer berjalan, dan loop deteksi dimulai.
6. MediaPipe menghitung `headDownScore` dan `gazeDownScore`, lalu YOLO mengecek keberadaan handphone.
7. Temporal smoother menggabungkan sinyal visual menjadi status:
   - `NORMAL`
   - `WARNING_LOOKING_DOWN`
   - `WARNING_PHONE_VISIBLE`
   - `USING_PHONE`
   - `FACE_MISSING`
8. Jika status `USING_PHONE` terdeteksi, aplikasi menaikkan level peringatan, memutar audio tertentu, dan dapat menjeda Pomodoro.
9. Saat sesi Pomodoro selesai, statistik sesi fokus ikut bertambah dan timer berpindah ke break atau sesi berikutnya.
10. User dapat menghentikan kamera, reset sesi, atau melanjutkan setelah peringatan ditutup.

## Threshold Model dan Rule

### YOLO

Konfigurasi inference YOLO ada di `app/libs/yoloPhoneOnnx.ts`.

| Parameter             |  Nilai | Fungsi                                              |
| --------------------- | -----: | --------------------------------------------------- |
| `inputSize`           |  `768` | Ukuran input model saat preprocessing               |
| `confidenceThreshold` | `0.25` | Deteksi dengan skor di bawah ini diabaikan          |
| `iouThreshold`        | `0.45` | Batas NMS untuk menghapus bounding box yang overlap |

Selain itu, pada rule temporal, deteksi handphone juga harus lolos filter:

| Parameter                 |   Nilai | Fungsi                                                |
| ------------------------- | ------: | ----------------------------------------------------- |
| `phoneAreaRatioThreshold` | `0.005` | Bounding box harus cukup besar relatif terhadap frame |

### MediaPipe

Konfigurasi Face Landmarker ada di `app/libs/createFaceLandmarker.ts`.

| Parameter                    | Nilai | Fungsi                         |
| ---------------------------- | ----: | ------------------------------ |
| `numFaces`                   |   `1` | Hanya satu wajah yang diproses |
| `minFaceDetectionConfidence` | `0.5` | Batas minimal deteksi wajah    |
| `minFacePresenceConfidence`  | `0.5` | Batas minimal kehadiran wajah  |
| `minTrackingConfidence`      | `0.5` | Batas minimal tracking wajah   |

Heuristik skor wajah yang dipakai untuk keputusan ada di `app/libs/faceScores.ts` dan rule temporal:

| Parameter           |  Nilai | Fungsi                                                |
| ------------------- | -----: | ----------------------------------------------------- |
| `headDownThreshold` | `0.58` | Skor head down dianggap aktif jika melewati nilai ini |
| `gazeDownThreshold` | `0.85` | Skor gaze down dianggap aktif jika melewati nilai ini |

### Temporal Rules

Rule temporal dipakai untuk mencegah alert terlalu sensitif karena satu frame saja.

| Parameter               |  Nilai | Fungsi                                                                      |
| ----------------------- | -----: | --------------------------------------------------------------------------- |
| `warningLookDownMs`     | `2500` | Warning muncul jika kepala/pandangan ke bawah cukup lama                    |
| `warningPhoneVisibleMs` |  `800` | Warning muncul jika handphone terlihat cukup lama                           |
| `violationOverlapMs`    | `1200` | Status `USING_PHONE` jika phone visible dan looking down overlap cukup lama |
| `violationPhoneOnlyMs`  | `2000` | Status `USING_PHONE` jika handphone terlihat terus menerus                  |
| `faceMissingMs`         | `3000` | Status `FACE_MISSING` jika wajah hilang terlalu lama                        |
| `historyWindowMs`       | `3000` | Window histori untuk perhitungan overlap temporal                           |

Urutan keputusan status ada di `app/libs/temporalRules.ts`:

1. `USING_PHONE`
2. `FACE_MISSING`
3. `WARNING_PHONE_VISIBLE`
4. `WARNING_LOOKING_DOWN`
5. `NORMAL`

## Model dan Aset

Model dan aset yang dipakai project sudah tersedia di `public`:

- `public/models/best.onnx`
- `public/models/face_landmarker.task`
- `public/mediapipe/wasm/*`
- `public/audio/hidup-jokowi.mp3`

Script `postinstall` akan menyalin file WASM MediaPipe dari `node_modules/@mediapipe/tasks-vision/wasm` ke `public/mediapipe/wasm`.

## Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Jalankan development server:

```bash
npm run dev
```

3. Buka:

```bash
http://localhost:3000
```

## Script

- `npm run dev` - menjalankan aplikasi di mode development
- `npm run build` - build production
- `npm run start` - menjalankan hasil build
- `npm run lint` - menjalankan ESLint
- `npm run copy:mediapipe-wasm` - menyalin WASM MediaPipe ke `public/mediapipe/wasm`

## Catatan Implementasi

- App Router digunakan di seluruh project.
- Route utama UI fokus ada di `/sesi-fokus`.
- Deteksi visual berjalan di client karena membutuhkan akses kamera dan browser API.
- Project memakai struktur komponen kecil agar mudah dirawat dan dikembangkan lagi.
