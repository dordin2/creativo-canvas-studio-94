
import { useEffect, useRef } from "react";
import { DesignElement } from "@/types/designTypes";
import { getVideoFromCache } from "@/utils/videoProcessor";

interface VideoElementProps {
  element: DesignElement;
}

const VideoElement = ({ element }: VideoElementProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (element.cacheKey && videoRef.current) {
      const cachedData = getVideoFromCache(element.cacheKey);
      if (cachedData) {
        videoRef.current.src = cachedData;
      }
    }
  }, [element.cacheKey]);
  
  return (
    <div className="w-full h-full">
      <video 
        ref={videoRef}
        src={element.dataUrl || element.src}
        controls={element.style?.controls === "true"}
        autoPlay={element.style?.autoplay === "true"}
        loop={element.style?.loop === "true"}
        muted={element.style?.muted === "true"}
        className="w-full h-full"
      />
    </div>
  );
};

export default VideoElement;
