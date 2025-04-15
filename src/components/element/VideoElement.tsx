
import { useEffect, useRef, useState } from "react";
import { DesignElement } from "@/types/designTypes";
import { getVideoFromCache } from "@/utils/videoProcessor";

interface VideoElementProps {
  element: DesignElement;
}

const VideoElement = ({ element }: VideoElementProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Try to get the video from cache first
    if (element.cacheKey) {
      const cachedData = getVideoFromCache(element.cacheKey);
      if (cachedData) {
        setVideoSrc(cachedData);
        setIsLoading(false);
        return;
      }
    }
    
    // If not in cache, use direct dataUrl or external src
    if (element.dataUrl) {
      setVideoSrc(element.dataUrl);
    } else if (element.src) {
      setVideoSrc(element.src);
    }
    
    setIsLoading(false);
  }, [element.cacheKey, element.dataUrl, element.src]);
  
  // Handle video loading events
  const handleLoadStart = () => {
    setIsLoading(true);
  };
  
  const handleCanPlay = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    console.error("VideoElement - Error loading video");
  };
  
  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <video 
        ref={videoRef}
        src={videoSrc}
        controls={element.style?.controls === "true"}
        autoPlay={element.style?.autoplay === "true"}
        loop={element.style?.loop === "true"}
        muted={element.style?.muted === "true"}
        preload="metadata"
        className="w-full h-full"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
      />
    </div>
  );
};

export default VideoElement;
