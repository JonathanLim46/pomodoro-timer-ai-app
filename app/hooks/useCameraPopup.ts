"use client";

import { RefObject, useCallback, useEffect, useState } from "react";

type UseCameraPopupOptions = {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
};

function hasModernPiPSupport() {
  return (
    typeof document !== "undefined" &&
    "pictureInPictureEnabled" in document &&
    document.pictureInPictureEnabled
  );
}

export function useCameraPopup({ videoRef, enabled }: UseCameraPopupOptions) {
  const [isSupported] = useState(() => hasModernPiPSupport());
  const [isActive, setIsActive] = useState(false);

  const openCameraPopup = useCallback(async () => {
    const video = videoRef.current;

    if (!enabled || !video) return false;
    if (!hasModernPiPSupport()) return false;

    const activeElement = document.pictureInPictureElement;
    if (activeElement === video) return true;

    if (video.readyState < 2) return false;

    try {
      await video.requestPictureInPicture();
      return true;
    } catch (error) {
      console.warn("Tidak dapat membuka popup kamera:", error);
      return false;
    }
  }, [enabled, videoRef]);

  const closeCameraPopup = useCallback(async () => {
    if (!hasModernPiPSupport()) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.warn("Tidak dapat menutup popup kamera:", error);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnter = () => setIsActive(true);
    const handleLeave = () => setIsActive(false);

    video.addEventListener("enterpictureinpicture", handleEnter);
    video.addEventListener("leavepictureinpicture", handleLeave);

    return () => {
      video.removeEventListener("enterpictureinpicture", handleEnter);
      video.removeEventListener("leavepictureinpicture", handleLeave);
    };
  }, [videoRef]);

  useEffect(() => {
    if (!enabled) {
      void closeCameraPopup();
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void openCameraPopup();
      }
    };

    const handlePageHide = () => {
      void openCameraPopup();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [enabled, openCameraPopup, closeCameraPopup]);

  return {
    isCameraPopupSupported: isSupported,
    isCameraPopupActive: isActive,
    openCameraPopup,
    closeCameraPopup,
  };
}
