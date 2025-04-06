
import { useRef, useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import RotationProperty from "./RotationProperty";
import { toast } from "sonner";

const VideoProperties = ({
  element
}: {
  element: DesignElement;
}) => {
  const {
    updateElement,
    handleImageUpload
  } = useDesignState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scaleValue, setScaleValue] = useState(100); // Default scale is 100%
  const [videoKey, setVideoKey] = useState(Date.now()); // Key to force video reload

  // Update scale value when element changes
  useEffect(() => {
    if (element.originalSize && element.size) {
      const newScaleValue = Math.round((element.size.width / element.originalSize.width) * 100);
      setScaleValue(newScaleValue);
    }
  }, [element.originalSize, element.size]);

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, {
      src: e.target.value,
      dataUrl: undefined,
      file: undefined
    });
    // Force video reload by changing key
    setVideoKey(Date.now());
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    
    handleImageUpload(element.id, file);
    
    // Force video reload by changing key
    setTimeout(() => {
      setVideoKey(Date.now());
    }, 100);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleVideoResize = (value: number[]) => {
    if (!element.originalSize) return;
    const scalePercentage = value[0];
    setScaleValue(scalePercentage);
    const scaleFactor = scalePercentage / 100;
    const newWidth = Math.round(element.originalSize.width * scaleFactor);
    const newHeight = Math.round(element.originalSize.height * scaleFactor);
    updateElement(element.id, {
      size: {
        width: newWidth,
        height: newHeight
      }
    });
  };

  const handleAutoplayChange = (checked: boolean) => {
    updateElement(element.id, {
      videoAutoplay: checked
    });
    // Force video reload by changing key
    setVideoKey(Date.now());
  };

  const handleMutedChange = (checked: boolean) => {
    updateElement(element.id, {
      videoMuted: checked
    });
    // Force video reload by changing key
    setVideoKey(Date.now());
  };

  const handleControlsChange = (checked: boolean) => {
    updateElement(element.id, {
      videoControls: checked
    });
    // Force video reload by changing key
    setVideoKey(Date.now());
  };

  const handleLoopChange = (checked: boolean) => {
    updateElement(element.id, {
      videoLoop: checked
    });
    // Force video reload by changing key
    setVideoKey(Date.now());
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Upload Video</Label>
        <div className="mt-2 flex flex-col gap-2">
          <input type="file" ref={fileInputRef} onChange={handleVideoFileSelect} accept="video/*" className="hidden" />
          <Button variant="outline" onClick={triggerFileInput} className="w-full flex items-center justify-center">
            <Upload className="h-4 w-4 mr-2" />
            {element.file ? "Change Video" : "Choose Video"}
          </Button>
          {element.file && <p className="text-xs text-muted-foreground">
            {element.file.name}
          </p>}
        </div>
      </div>
      
      <div>
        <Label htmlFor="video-url">Video URL</Label>
        <Input
          id="video-url"
          type="text"
          value={element.src || ''}
          onChange={handleVideoUrlChange}
          placeholder="https://example.com/video.mp4"
          className="mt-1"
        />
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <Label>Resize Video</Label>
          <span className="text-sm font-medium">{scaleValue}%</span>
        </div>
        <Slider value={[scaleValue]} min={10} max={200} step={1} onValueChange={handleVideoResize} className="mb-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>10%</span>
          <span>200%</span>
        </div>
        <div className="text-sm mt-2">
          {element.size?.width} × {element.size?.height} px
        </div>
      </div>
      
      <div className="border rounded-md p-3 space-y-3">
        <h3 className="text-sm font-medium">Video Settings</h3>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="video-autoplay" className="cursor-pointer">Autoplay</Label>
          <Switch 
            id="video-autoplay" 
            checked={element.videoAutoplay || false}
            onCheckedChange={handleAutoplayChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="video-muted" className="cursor-pointer">Muted</Label>
          <Switch 
            id="video-muted" 
            checked={element.videoMuted !== false}
            onCheckedChange={handleMutedChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="video-controls" className="cursor-pointer">Show Controls</Label>
          <Switch 
            id="video-controls" 
            checked={element.videoControls !== false}
            onCheckedChange={handleControlsChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="video-loop" className="cursor-pointer">Loop</Label>
          <Switch 
            id="video-loop" 
            checked={element.videoLoop || false}
            onCheckedChange={handleLoopChange}
          />
        </div>
      </div>
      
      {(element.dataUrl || element.src) && (
        <div className="mt-4 border rounded-md p-2 bg-background">
          <video 
            key={videoKey}
            src={element.dataUrl || element.src} 
            className="w-full h-32 object-contain" 
            controls 
            muted
          />
        </div>
      )}
      
      <RotationProperty element={element} />
    </div>
  );
};

export default VideoProperties;
