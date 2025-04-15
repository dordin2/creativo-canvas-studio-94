
import { useRef, useState } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { processVideoUpload } from "@/utils/videoProcessor";
import { Slider } from "@/components/ui/slider";
import { getRotation } from "@/utils/elementStyles";

interface VideoPropertiesProps {
  element: DesignElement;
}

const VideoProperties = ({ element }: VideoPropertiesProps) => {
  const { updateElement } = useDesignState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(getRotation(element));
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      await processVideoUpload(file, (updatedData) => {
        updateElement(element.id, updatedData);
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleExternalUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, {
      src: e.target.value,
      dataUrl: undefined
    });
  };
  
  const handleControlsChange = (checked: boolean) => {
    updateElement(element.id, {
      style: {
        ...element.style,
        controls: String(checked)
      }
    });
  };
  
  const handleAutoplayChange = (checked: boolean) => {
    updateElement(element.id, {
      style: {
        ...element.style,
        autoplay: String(checked)
      }
    });
  };
  
  const handleLoopChange = (checked: boolean) => {
    updateElement(element.id, {
      style: {
        ...element.style,
        loop: String(checked)
      }
    });
  };
  
  const handleMutedChange = (checked: boolean) => {
    updateElement(element.id, {
      style: {
        ...element.style,
        muted: String(checked)
      }
    });
  };
  
  const handleRotationChange = (value: number[]) => {
    const newRotation = Math.round(value[0]);
    setRotation(newRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label>Replace Video</Label>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="video/*"
        />
        <Button 
          variant="outline" 
          className="w-full mt-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Upload new video"}
        </Button>
      </div>
      
      <div>
        <Label>External URL</Label>
        <Input 
          placeholder="https://example.com/video.mp4"
          value={element.src || ''}
          onChange={handleExternalUrlChange}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label>Rotation</Label>
        <div className="space-y-2">
          <Slider
            value={[rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={handleRotationChange}
            className="my-4"
          />
          <div className="flex gap-4 items-center">
            <Input 
              type="number" 
              value={rotation}
              onChange={(e) => handleRotationChange([Number(e.target.value) || 0])}
              min={-360}
              max={360}
              className="w-24"
            />
            <span className="text-sm">degrees</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2 mt-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="controls" 
            checked={element.style?.controls === "true"} 
            onCheckedChange={handleControlsChange}
          />
          <Label htmlFor="controls">Show controls</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="autoplay" 
            checked={element.style?.autoplay === "true"} 
            onCheckedChange={handleAutoplayChange}
          />
          <Label htmlFor="autoplay">Autoplay</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="loop" 
            checked={element.style?.loop === "true"} 
            onCheckedChange={handleLoopChange}
          />
          <Label htmlFor="loop">Loop</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="muted" 
            checked={element.style?.muted === "true"} 
            onCheckedChange={handleMutedChange}
          />
          <Label htmlFor="muted">Muted</Label>
        </div>
      </div>
      
      {element.dataUrl && (
        <div className="mt-4 rounded-md overflow-hidden">
          <video 
            src={element.dataUrl}
            controls
            muted
            className="w-full h-32 object-contain bg-gray-100"
          />
        </div>
      )}
    </div>
  );
};

export default VideoProperties;
