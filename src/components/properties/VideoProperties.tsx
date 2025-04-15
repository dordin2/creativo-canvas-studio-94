
import { useState, useRef, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload, Trash2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

interface VideoPropertiesProps {
  element: DesignElement;
}

const VideoProperties = ({ element }: VideoPropertiesProps) => {
  const { handleVideoUpload, updateElement, updateElementWithoutHistory } = useDesignState();
  const [isPlaying, setIsPlaying] = useState(element.isPlaying || false);
  const [currentTime, setCurrentTime] = useState(element.currentTime || 0);
  const [duration, setDuration] = useState(element.videoDuration || 0);
  const [volume, setVolume] = useState(element.videoVolume || 1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoopEnabled, setIsLoopEnabled] = useState(false);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(false);
  const { t, language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (videoRef.current && element.dataUrl) {
      videoRef.current.load();
      
      // Set current time if specified
      if (element.currentTime !== undefined) {
        videoRef.current.currentTime = element.currentTime;
      }
      
      // Set volume
      if (element.videoVolume !== undefined) {
        videoRef.current.volume = element.videoVolume;
      }
    }
  }, [element.dataUrl, element.currentTime, element.videoVolume]);
  
  // Handle file upload
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if the file is a video
    if (!file.type.startsWith('video/')) {
      toast.error(language === 'en' 
        ? 'Please select a valid video file' 
        : 'אנא בחר קובץ וידאו תקין');
      return;
    }
    
    // Check file size (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      toast.error(language === 'en' 
        ? 'Video file is too large (max 50MB)' 
        : 'קובץ הוידאו גדול מדי (מקסימום 50MB)');
      return;
    }
    
    // Upload the video file
    handleVideoUpload(element.id, file);
    
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveVideo = () => {
    updateElement(element.id, {
      dataUrl: undefined,
      thumbnailDataUrl: undefined,
      videoDuration: 0,
      isPlaying: false,
      currentTime: 0
    });
    
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };
  
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
  
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        toast.error(language === 'en' ? 'Failed to play video' : 'נכשל בהפעלת הוידאו');
        console.error('Video play error:', err);
      });
    }
    
    setIsPlaying(!isPlaying);
    updateElementWithoutHistory(element.id, { isPlaying: !isPlaying });
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    
    const newTime = value[0];
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    updateElementWithoutHistory(element.id, { currentTime: newTime });
  };
  
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    
    const newVolume = value[0];
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
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newMuteState = !isMuted;
    videoRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
  };
  
  const toggleLoop = () => {
    if (!videoRef.current) return;
    
    const newLoopState = !isLoopEnabled;
    videoRef.current.loop = newLoopState;
    setIsLoopEnabled(newLoopState);
  };
  
  const toggleAutoplay = () => {
    setIsAutoplayEnabled(prev => !prev);
    
    // Note: Autoplay might be blocked by browsers without user interaction
    if (!isAutoplayEnabled && videoRef.current) {
      videoRef.current.autoplay = true;
    } else if (videoRef.current) {
      videoRef.current.autoplay = false;
    }
  };
  
  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle video ended
  const handleVideoEnded = () => {
    if (!isLoopEnabled) {
      setIsPlaying(false);
      updateElementWithoutHistory(element.id, { isPlaying: false });
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label>{language === 'en' ? 'Video Source' : 'מקור הוידאו'}</Label>
        <div className="flex items-center gap-2 mt-2">
          <Button 
            variant="outline" 
            className="flex-grow"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {element.dataUrl 
              ? (language === 'en' ? 'Change Video' : 'החלף וידאו') 
              : (language === 'en' ? 'Upload Video' : 'העלה וידאו')}
          </Button>
          
          {element.dataUrl && (
            <Button 
              variant="destructive" 
              size="icon"
              onClick={handleRemoveVideo}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="video/*" 
            onChange={handleVideoFileChange}
          />
        </div>
      </div>
      
      {element.dataUrl && (
        <>
          <div className="aspect-video relative bg-black rounded-md overflow-hidden">
            <video
              ref={videoRef}
              src={element.dataUrl}
              className="w-full h-full"
              poster={element.thumbnailDataUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnded}
              playsInline
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Playback Position' : 'מיקום ניגון'}</Label>
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Volume' : 'עוצמת קול'}</Label>
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="loop"
                checked={isLoopEnabled}
                onCheckedChange={toggleLoop}
              />
              <Label htmlFor="loop">
                {language === 'en' ? 'Loop Video' : 'לולאת וידאו'}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="autoplay"
                checked={isAutoplayEnabled}
                onCheckedChange={toggleAutoplay}
              />
              <Label htmlFor="autoplay">
                {language === 'en' ? 'Autoplay (may be blocked by browser)' : 'ניגון אוטומטי (עשוי להיחסם על-ידי הדפדפן)'}
              </Label>
            </div>
          </div>
        </>
      )}
      
      {!element.dataUrl && (
        <div className="bg-gray-100 rounded-md p-4 text-center text-gray-500">
          {language === 'en' 
            ? 'No video uploaded. Click "Upload Video" to add a video.'
            : 'אין וידאו. לחץ על "העלה וידאו" כדי להוסיף וידאו.'}
        </div>
      )}
      
      {element.dataUrl && element.fileMetadata && (
        <div className="text-xs text-gray-500 mt-2">
          <p>{element.fileMetadata.name}</p>
          <p>
            {(element.fileMetadata.size / (1024 * 1024)).toFixed(2)} MB | 
            {element.videoDuration ? ` ${formatTime(element.videoDuration)}` : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoProperties;
