import React, { useRef, useEffect, useState, memo } from "react";

const LoadingSpinner = memo(() => (
  <>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "15px",
        height: "15px",
        border: "1.5px solid rgba(255, 255, 255, 0.3)",
        borderTop: "1.5px solid #ffffff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  </>
));

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface VideoCardProps {
  videoPreviewUrl: string | null;
  thumbnailUrl: string;
  durationInSeconds?: number;
  onClick?: () => void;
  width?: string;
  height?: string;
  loading?: boolean;
  borderRadius?: string;
}

const VideoCard: React.FC<VideoCardProps> = memo(
  ({
    videoPreviewUrl,
    thumbnailUrl,
    durationInSeconds,
    onClick,
    width = "100%",
    height = "100%",
    loading = false,
    borderRadius = "8px",
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    useEffect(() => {
      if (videoRef.current && !loading && videoPreviewUrl) {
        videoRef.current.load();
      }
    }, [videoPreviewUrl, loading]);

    const handleVideoLoaded = () => {
      setIsVideoLoaded(true);
    };

    const optimizedVideoUrl =
      videoPreviewUrl && !loading ? `${videoPreviewUrl}?streaming=true` : null;

    return (
      <div
        style={{
          width,
          height,
          position: "relative",
          overflow: "hidden",
          borderRadius,
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          style={{
            width: "100%",
            height: "100%",
            borderRadius,
            objectFit: "cover",
          }}
        />

        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LoadingSpinner />
          </div>
        )}

        {optimizedVideoUrl && (
          <video
            ref={videoRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isVideoLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
            autoPlay
            loop
            playsInline
            muted
            onLoadedData={handleVideoLoaded}
          >
            <source src={optimizedVideoUrl} type="video/mp4" />
          </video>
        )}

        {durationInSeconds && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "2px 4px",
              borderRadius: "2px",
              fontSize: "12px",
            }}
          >
            {formatDuration(durationInSeconds)}
          </div>
        )}
      </div>
    );
  }
);

export default VideoCard;
