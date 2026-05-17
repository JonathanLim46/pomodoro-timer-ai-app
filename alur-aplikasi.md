# Alur Aplikasi Project M App

Dokumen ini merangkum alur aplikasi berdasarkan analisis file utama pada project, dari model MediaPipe, model YOLO, sampai temporal smoothing dan eskalasi warning.

## 1. Ringkasan Alur Utama

| Tahap | File | Input | Proses | Output | Peran dalam alur |
|---|---|---|---|---|---|
| Inisialisasi MediaPipe | [app/libs/createFaceLandmarker.ts](app/libs/createFaceLandmarker.ts) | `face_landmarker.task` + wasm MediaPipe | Membuat `FaceLandmarker` dengan mode `VIDEO` dan satu wajah | Instance `FaceLandmarker` | Fondasi deteksi wajah |
| Ekstraksi skor wajah | [app/libs/faceScores.ts](app/libs/faceScores.ts) | Landmark wajah dari MediaPipe | Hitung `headDownScore` dan `gazeDownScore` dari landmark | Skor numerik 0..1 + `faceDetected` | Mengubah landmark jadi sinyal perilaku |
| Jalur face-only | [app/hooks/useFaceLandmarkerScores.ts](app/hooks/useFaceLandmarkerScores.ts) | Kamera + Face Landmarker | Loop deteksi wajah setiap 100 ms | State skor wajah | Versi sederhana untuk observasi wajah saja |
| Inisialisasi YOLO | [app/libs/yoloPhoneOnnx.ts](app/libs/yoloPhoneOnnx.ts) | Model `best.onnx` | Buat session ONNX Runtime WASM | `InferenceSession` | Fondasi deteksi handphone |
| Inferensi YOLO | [app/libs/yoloPhoneOnnx.ts](app/libs/yoloPhoneOnnx.ts) | Frame video | Preprocess, run model, decode output, NMS | Array `PhoneDetection[]` | Deteksi handphone yang siap dipakai rule engine |
| Orkestrasi utama | [app/hooks/useProctoringDetection.ts](app/hooks/useProctoringDetection.ts) | Kamera + MediaPipe + YOLO | Loop MediaPipe 100 ms, YOLO 300 ms, gabungkan hasil | `faceScores`, `phoneState`, `decision` | Pusat kontrol proctoring |
| Decision engine | [app/libs/temporalRules.ts](app/libs/temporalRules.ts) | Skor wajah + deteksi handphone | Temporal smoothing berbasis history dan durasi | Status `NORMAL`, `WARNING_*`, `USING_PHONE`, `FACE_MISSING` | Menentukan arti sinyal mentah |
| Mapping status ke UI | [app/sesi-fokus/uiModel.tsx](app/sesi-fokus/uiModel.tsx) | `decision.status` | Konversi status ke warna, ikon, teks | `AlertInfo`, indikator fokus | Lapisan presentasi |
| Tampilan monitoring | [app/sesi-fokus/components/FocusMonitoringPanel.tsx](app/sesi-fokus/components/FocusMonitoringPanel.tsx) | `decision`, skor wajah, phone state | Render status dan durasi temporal | UI monitoring | Panel visual untuk user |
| Tampilan video + bbox | [app/sesi-fokus/components/FocusSessionCard.tsx](app/sesi-fokus/components/FocusSessionCard.tsx) | `phoneDetections` | Tampilkan bounding box handphone di video | Overlay kotak deteksi | Visualisasi hasil YOLO |
| Eskalasi warning | [app/hooks/useProctoringDetection.ts](app/hooks/useProctoringDetection.ts) + [app/components/UsingPhoneWarningModal.tsx](app/components/UsingPhoneWarningModal.tsx) | Status `USING_PHONE` berulang | Hitung jumlah insiden dan naikkan level | Level 0, 1, 2, 3 | Mekanisme peringatan bertingkat |
| Integrasi halaman | [app/sesi-fokus/page.tsx](app/sesi-fokus/page.tsx) | Hook proctoring + Pomodoro | Pause otomatis saat warning, play audio | Sesi fokus terkontrol | Mengikat semua sistem ke UI utama |

## 2. Ringkasan Temporal Smoothing

| Kondisi | Sumber sinyal | Cara dihitung | Threshold | Hasil |
|---|---|---|---|---|
| Head down | MediaPipe via [app/libs/faceScores.ts](app/libs/faceScores.ts) | Skor kepala dari posisi hidung, mata, dan dagu | `headDownScore >= 0.58` | `headDown = true` |
| Gaze down | MediaPipe via [app/libs/faceScores.ts](app/libs/faceScores.ts) | Skor arah pandangan dari iris dan kelopak mata | `gazeDownScore >= 0.85` | `gazeDown = true` |
| Looking down | Gabungan head down + gaze down | `headDown || gazeDown` | Jika salah satu true | Dipakai untuk warning dan violation |
| Phone visible | YOLO via [app/libs/yoloPhoneOnnx.ts](app/libs/yoloPhoneOnnx.ts) | Deteksi lolos confidence + area ratio | `score >= 0.25` dan `areaRatio >= 0.005` | `phoneVisible = true` |
| Face missing | MediaPipe | `faceDetected = false` berturut-turut | `>= 3000 ms` | `FACE_MISSING` |
| Warning looking down | Temporal history | Durasi kontinu `lookingDown` | `>= 2500 ms` | `WARNING_LOOKING_DOWN` |
| Warning phone visible | Temporal history | Durasi kontinu `phoneVisible` | `>= 800 ms` | `WARNING_PHONE_VISIBLE` |
| Violation overlap | Temporal history | Overlap `phoneVisible && lookingDown` dalam window history | `>= 1200 ms` | `USING_PHONE` |
| Violation phone only | Temporal history | Durasi kontinu `phoneVisible` | `>= 2000 ms` | `USING_PHONE` |

## 3. Urutan Prioritas Status di `TemporalSmoother`

| Prioritas | Status | Makna |
|---|---|---|
| 1 | `USING_PHONE` | Pelanggaran paling serius |
| 2 | `FACE_MISSING` | Wajah hilang terlalu lama |
| 3 | `WARNING_PHONE_VISIBLE` | HP terlihat cukup lama |
| 4 | `WARNING_LOOKING_DOWN` | Kepala/pandangan ke bawah cukup lama |
| 5 | `NORMAL` | Tidak ada kondisi bermasalah |

## 4. Eskalasi Level `USING_PHONE`

| Deteksi insiden ke | Level | Efek UI | Keterangan |
|---|---|---|---|
| 1 sampai 4 | 0 | Modal tidak dibuka | Masih dianggap insiden awal |
| 5 | 1 | Modal level 1 | Eskalasi pertama |
| 10 | 2 | Modal level 2 | Eskalasi kedua |
| 15 | 3 | Modal level 3 | Level tertinggi |
| >15 | 3 | Tetap level 3 | Tidak ada level di atas 3 |

## 5. Alur Singkat dari Kamera ke Warning

| Langkah | File terkait | Apa yang terjadi |
|---|---|---|
| Kamera aktif | [app/hooks/useProctoringDetection.ts](app/hooks/useProctoringDetection.ts) | `getUserMedia`, stream masuk ke video |
| Deteksi wajah | [app/libs/createFaceLandmarker.ts](app/libs/createFaceLandmarker.ts) + [app/libs/faceScores.ts](app/libs/faceScores.ts) | Landmark diubah jadi skor kepala dan mata |
| Deteksi handphone | [app/libs/yoloPhoneOnnx.ts](app/libs/yoloPhoneOnnx.ts) | Frame video dianalisis YOLO |
| Gabung sinyal | [app/libs/temporalRules.ts](app/libs/temporalRules.ts) | Status proctoring ditentukan dari durasi |
| Eskalasi warning | [app/hooks/useProctoringDetection.ts](app/hooks/useProctoringDetection.ts) | Hitung insiden `USING_PHONE` dan naikkan level |
| Tampilan alert | [app/sesi-fokus/uiModel.tsx](app/sesi-fokus/uiModel.tsx) + [app/components/UsingPhoneWarningModal.tsx](app/components/UsingPhoneWarningModal.tsx) | Status ditampilkan sebagai warning modal dan panel monitoring |

