import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export async function createFaceLandmarker() {
    const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm');

    return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: '/models/face_landmarker.task',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });
}