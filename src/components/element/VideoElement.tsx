
import React, { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Play, Pause, Volume2, VolumeX, Maximize, MinusCircle, PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface VideoElementProps {
  element: DesignElement;
  isGameMode: boolean;
}

const VideoElement: React.FC<VideoElementProps> = ({ element, isGameMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(element.isPlaying || false);
  const [currentTime, setCurrentTime] = useState(element.currentTime || 0);
  const [duration, setDuration] = useState(element.videoDuration || 0);
  const [volume, setVolume] = useState(element.videoVolume || 1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const { updateElement, updateElementWithoutHistory, isGameMode: globalGameMode } = useDesignState();
  
  useEffect(() => {
    if (videoRef.current && element.dataUrl) {
      // Set current time if specified
      if (element.currentTime !== undefined && videoRef.current.currentTime !== element.currentTime) {
        videoRef.current.currentTime = element.currentTime;
      }
      
      // Set volume
      if (element.videoVolume !== undefined) {
        videoRef.current.volume = element.videoVolume;
      }
      
      // Start playing if needed
      if (element.isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(err => {
          console.error("Failed to autoplay video:", err);
        });
      }
    }
  }, [element.dataUrl, element.currentTime, element.videoVolume, element.isPlaying]);
  
  // Update duration once video is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      
      // Update element with duration if not set
      if (!element.videoDuration) {
        updateElementWithoutHistory(element.id, { videoDuration });
      }
    }
  };
  
  // Toggle play/pause
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        toast.error("Failed to play video");
        console.error("Video play error:", err);
      });
    }
    
    setIsPlaying(!isPlaying);
    updateElementWithoutHistory(element.id, { isPlaying: !isPlaying });
  };
  
  // Toggle mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!videoRef.current) return;
    
    const newMuteState = !isMuted;
    videoRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
    
    updateElementWithoutHistory(element.id, { videoVolume: newVolume });
  };
  
  // Handle seeking in the video
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    updateElementWithoutHistory(element.id, { currentTime: newTime });
  };
  
  // Update current time as video plays
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!videoRef.current) return;
    
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Failed to enter fullscreen:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error("Failed to exit fullscreen:", err);
      });
    }
  };
  
  // Handle video loading issues
  const handleVideoError = () => {
    console.error("Video failed to load:", element.dataUrl);
    toast.error("Failed to load video");
  };
  
  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle mouse enter/leave to show/hide controls
  const handleMouseEnter = () => {
    setShowControls(true);
  };
  
  const handleMouseLeave = () => {
    setShowControls(false);
  };
  
  // Render a placeholder if no video is available
  if (!element.dataUrl && !element.thumbnailDataUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
        <p className="text-gray-500">No video source</p>
      </div>
    );
  }
  
  return (
    <div 
      className="video-element w-full h-full relative rounded-md overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={element.dataUrl as string}
        poster={element.thumbnailDataUrl as string}
        className="w-full h-full object-contain"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={handleVideoError}
        playsInline
        preload="metadata"
        style={{ background: 'black' }}
      />
      
      {isGameMode ? (
        <div className="absolute inset-0" onClick={(e) => e.stopPropagation()}>
          {/* Game mode has simpler controls on click */}
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer" 
            onClick={togglePlay}
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                <Play className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Editing mode has full controls */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 space-y-2">
              <div className="flex items-center justify-between">
                <button 
                  onClick={togglePlay}
                  className="p-1 text-white rounded hover:bg-gray-700"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                
                <div className="flex-1 mx-2">
                  <div className="text-xs text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1"
                  />
                </div>
                
                <div className="flex items-center">
                  <button 
                    onClick={toggleMute}
                    className="p-1 text-white rounded hover:bg-gray-700"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 mx-1"
                  />
                  
                  <button 
                    onClick={toggleFullscreen}
                    className="p-1 text-white rounded hover:bg-gray-700"
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoElement;
