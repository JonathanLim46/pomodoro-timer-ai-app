function clamp01(value: number) {
    return Math.max(0, Math.min(1, value));
}

function safeDiv(a: number, b: number) {
    if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(b) < 1e-6) return 0;
    return a / b;
}

/* 
Heuristik headDown
* membandingkan posisi hidung terhadap garis mata dan dagu
* Nilai makin tinggi = kepala cenderung makin menunduk
*/
export function computeHeadDownScore(landmarks: any[]) {
    const LEFT_EYE_OUTER = 33;
    const RIGHT_EYE_OUTER = 263;
    const NOSE_TIP = 1;
    const CHIN = 152;

    const leftEyeOuter = landmarks[LEFT_EYE_OUTER];
    const rightEyeOuter = landmarks[RIGHT_EYE_OUTER];
    const noseTip = landmarks[NOSE_TIP];
    const chin = landmarks[CHIN]

    if(!leftEyeOuter || !rightEyeOuter || !noseTip || !chin) return 0;

    const eyeMidY = (leftEyeOuter.y + rightEyeOuter.y) / 2;
    const faceHeight = chin.y - eyeMidY;
    const raw = safeDiv(noseTip.y - eyeMidY, faceHeight);

    return clamp01((raw - 0.38) / (0.58 - 0.38));
}

/* 
Heuristik gazeDown:
* membandingkan posisi iris terhadap kelopak atas dan bawah.
* nilai makin tinggi = pandangan mata cenderung makin ke bawah
*/
export function computeGazeDownScore(landmarks: any[]){
    const LEFT_EYE_TOP = 159;
    const LEFT_EYE_BOTTOM = 145;
    const LEFT_IRIS_CENTER = 468;

    const RIGHT_EYE_TOP = 386;
    const RIGHT_EYE_BOTTOM = 374;
    const RIGHT_IRIS_CENTER = 473;

    const leftTop = landmarks[LEFT_EYE_TOP];
    const leftBottom = landmarks[LEFT_EYE_BOTTOM];
    const leftIris = landmarks[LEFT_IRIS_CENTER];

    const rightTop = landmarks[RIGHT_EYE_TOP];
    const rightBottom = landmarks[RIGHT_EYE_BOTTOM];
    const rightIris = landmarks[RIGHT_IRIS_CENTER];
    
    if(!leftTop || !leftBottom || !leftIris || !rightTop || !rightBottom || !rightIris) return 0;

    const leftRaw = safeDiv(leftIris.y - leftTop.y, leftBottom.y - leftTop.y);
    const rightRaw = safeDiv(rightIris.y - rightTop.y, rightBottom.y - rightTop.y);
    const avgRaw = (leftRaw - rightRaw) / 2;

    return clamp01((avgRaw - 0.5) / (0.85 - 0.5));
}
