
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
  
  // Load video and update duration when element changes
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
        toast.error("Failed to enter fullscreen");
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error("Exit fullscreen error:", err);
      });
    }
  };
  
  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Show/hide controls on hover
  const handleMouseEnter = () => {
    setShowControls(true);
  };
  
  const handleMouseLeave = () => {
    setShowControls(false);
  };
  
  // Update video current time in the element data every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (videoRef.current && isPlaying) {
        updateElementWithoutHistory(element.id, { currentTime: videoRef.current.currentTime });
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [element.id, isPlaying, updateElementWithoutHistory]);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.src.startsWith('blob:')) {
        // Save current state before unmounting
        updateElementWithoutHistory(element.id, {
          currentTime: videoRef.current.currentTime,
          isPlaying: !videoRef.current.paused,
          videoVolume: videoRef.current.volume
        });
      }
    };
  }, [element.id, updateElementWithoutHistory]);
  
  // Handle end of video
  const handleVideoEnded = () => {
    setIsPlaying(false);
    updateElementWithoutHistory(element.id, { isPlaying: false, currentTime: 0 });
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };
  
  // Ensure we exit fullscreen when switching to game mode or changing active element
  useEffect(() => {
    if (isFullscreen && globalGameMode) {
      document.exitFullscreen().catch(err => {
        console.error("Exit fullscreen error:", err);
      });
      setIsFullscreen(false);
    }
  }, [globalGameMode, isFullscreen]);
  
  // Simplify controls in game mode
  const renderGameModeControls = () => {
    if (!showControls) return null;
    
    return (
      <div 
        className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex items-center justify-between"
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="text-white p-1 rounded hover:bg-gray-700"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <div className="flex-1 mx-2">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-300 rounded appearance-none cursor-pointer"
          />
        </div>
        
        <button 
          className="text-white p-1 rounded hover:bg-gray-700"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    );
  };
  
  // Full controls for edit mode
  const renderEditModeControls = () => {
    if (!showControls) return null;
    
    return (
      <div 
        className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex flex-col gap-2"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-white text-xs">{formatTime(currentTime)}</span>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-300 rounded appearance-none cursor-pointer"
            />
          </div>
          <span className="text-white text-xs">{formatTime(duration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              className="text-white p-1 rounded hover:bg-gray-700"
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <div className="flex items-center">
              <button 
                className="text-white p-1 rounded hover:bg-gray-700"
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-300 rounded appearance-none cursor-pointer mx-1"
              />
            </div>
          </div>
          
          <button 
            className="text-white p-1 rounded hover:bg-gray-700"
            onClick={toggleFullscreen}
            title="Fullscreen"
          >
            <Maximize size={16} />
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div 
      className="relative w-full h-full video-element"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!element.dataUrl && (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded">
          <span className="text-gray-500 text-sm">No video selected</span>
        </div>
      )}
      
      {element.dataUrl && (
        <video
          ref={videoRef}
          src={element.dataUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          onClick={e => {
            if (isGameMode) {
              togglePlay(e);
            }
          }}
          style={{ cursor: isGameMode ? "pointer" : "move" }}
          poster={element.thumbnailDataUrl}
          playsInline
        />
      )}
      
      {element.dataUrl && isGameMode && renderGameModeControls()}
      {element.dataUrl && !isGameMode && renderEditModeControls()}
    </div>
  );
};

export default VideoElement;
