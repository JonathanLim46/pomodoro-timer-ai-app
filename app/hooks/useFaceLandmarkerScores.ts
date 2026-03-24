'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import { createFaceLandmarker } from '../libs/createFaceLandmarker';
import { computeGazeDownScore, computeHeadDownScore } from '../libs/faceScores';

type FaceScoreState = {
    headDownScore: number;
    gazeDownScore: number;
    faceDetected: boolean;
};

const INITIAL_SCORES: FaceScoreState = {
    headDownScore: 0,
    gazeDownScore: 0,
    faceDetected: false,
};

export function useFaceLandmarkerScores() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const intervalRef = useRef<number | null>(null);
    const lastLogTimeRef = useRef(0);

    const [scores, setScores] = useState<FaceScoreState>(INITIAL_SCORES);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);

    const stopDetectLoop = useCallback(() => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const stopCamera = useCallback(() => {
        stopDetectLoop();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }

        setCameraOn(false);
        setScores(INITIAL_SCORES);
    }, [stopDetectLoop]);

    const detectOnce = useCallback(() => {
        const video = videoRef.current;
        const faceLandmarker = faceLandmarkerRef.current;

        if (!video || !faceLandmarker) return;
        if (video.readyState < 2) return;

        const nowMs = performance.now();
        const result = faceLandmarker.detectForVideo(video, nowMs);

        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
            const landmarks = result.faceLandmarks[0];

            const headDownScore = computeHeadDownScore(landmarks);
            const gazeDownScore = computeGazeDownScore(landmarks);

            const nextScores: FaceScoreState = {
                headDownScore,
                gazeDownScore,
                faceDetected: true,
            };

            setScores(nextScores);

            if (nowMs - lastLogTimeRef.current > 300) {
                console.log('detectOnce nextScores:', nextScores);
                lastLogTimeRef.current = nowMs;
            }
        } else {
            setScores({
                headDownScore: 0,
                gazeDownScore: 0,
                faceDetected: false,
            });
        }
    }, []);

    const startCamera = useCallback(async () => {
        const video = videoRef.current;
        const faceLandmarker = faceLandmarkerRef.current;

        if (!video || !faceLandmarker) return;

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 },
            },
            audio: false,
        });

        streamRef.current = stream;
        video.srcObject = stream;

        await video.play();

        setCameraOn(true);

        stopDetectLoop();

        // Jalankan deteksi tiap 100 ms 
        intervalRef.current = window.setInterval(() => {
            detectOnce();
        }, 100);
    }, [detectOnce, stopDetectLoop]);

    // Inisialisasi Face Landmarker
    useEffect(() => {
        let mounted = true;

        async function init() {
            try {
                setLoading(true);
                const faceLandmarker = await createFaceLandmarker();

                if (!mounted) {
                    faceLandmarker.close();
                    return;
                }

                faceLandmarkerRef.current = faceLandmarker;
                setReady(true);
            } catch (error) {
                console.error('Gagal inisialisasi Face Landmarker:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        init();

        return () => {
            mounted = false;
            stopCamera();
            faceLandmarkerRef.current?.close();
            faceLandmarkerRef.current = null;
        };
    }, [stopCamera]);

    return {
        videoRef,
        scores,
        loading,
        ready,
        cameraOn,
        startCamera,
        stopCamera,
    };
}