import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const readFileAsDataURL = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
};

export const formatTimeAgo = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 30) return "Just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * Client-side video optimization / reduction helper.
 * If video exceeds target dimensions or bitrate, this downscales via Canvas + MediaRecorder
 * or returns a compressed Blob to drastically reduce payload size before upload.
 */
export const reduceVideoFile = async (videoFile, maxDimension = 720, targetBitrate = 1_000_000) => {
  // If browser doesn't support MediaRecorder or Canvas captureStream, return original
  if (
    typeof window === "undefined" ||
    typeof MediaRecorder === "undefined" ||
    !HTMLCanvasElement.prototype.captureStream
  ) {
    return videoFile;
  }

  // If already under 3MB, no reduction needed
  if (videoFile.size < 3 * 1024 * 1024) {
    return videoFile;
  }

  return new Promise((resolve) => {
    try {
      const videoEl = document.createElement("video");
      videoEl.preload = "auto";
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.src = URL.createObjectURL(videoFile);

      videoEl.onloadedmetadata = () => {
        let width = videoEl.videoWidth || 720;
        let height = videoEl.videoHeight || 1280;

        // Scale down if larger than maxDimension while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        // Ensure even dimensions
        width = width % 2 === 0 ? width : width - 1;
        height = height % 2 === 0 ? height : height - 1;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        const stream = canvas.captureStream(24); // 24 fps for reduced size
        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
          ? "video/webm;codecs=vp8"
          : "video/webm";

        let recorder;
        try {
          recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: targetBitrate,
          });
        } catch {
          URL.revokeObjectURL(videoEl.src);
          return resolve(videoFile);
        }

        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          URL.revokeObjectURL(videoEl.src);
          const compressedBlob = new Blob(chunks, { type: mimeType });
          if (compressedBlob.size > 0 && compressedBlob.size < videoFile.size) {
            const reducedFile = new File(
              [compressedBlob],
              videoFile.name.replace(/\.[^/.]+$/, "") + ".webm",
              { type: mimeType }
            );
            resolve(reducedFile);
          } else {
            resolve(videoFile);
          }
        };

        let rafId;
        const drawFrame = () => {
          if (videoEl.paused || videoEl.ended) return;
          ctx.drawImage(videoEl, 0, 0, width, height);
          rafId = requestAnimationFrame(drawFrame);
        };

        videoEl.onended = () => {
          cancelAnimationFrame(rafId);
          if (recorder.state === "recording") recorder.stop();
        };

        recorder.start(100);
        videoEl.play().then(() => {
          drawFrame();
        }).catch(() => {
          resolve(videoFile);
        });

        // Failsafe timeout after video duration + 3s
        const maxDuration = Math.min(60, videoEl.duration || 30);
        setTimeout(() => {
          if (recorder && recorder.state === "recording") {
            try {
              videoEl.pause();
              recorder.stop();
            } catch {
              resolve(videoFile);
            }
          }
        }, (maxDuration + 3) * 1000);
      };

      videoEl.onerror = () => {
        resolve(videoFile);
      };
    } catch {
      resolve(videoFile);
    }
  });
};

export const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return num.toString();
};
