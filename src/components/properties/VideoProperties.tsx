
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { processVideoUpload } from "@/utils/videoProcessor";
import { useRef } from "react";

interface VideoPropertiesProps {
  element: DesignElement;
}

const VideoProperties = ({ element }: VideoPropertiesProps) => {
  const { updateElement } = useDesignState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processVideoUpload(file, (updatedData) => {
        updateElement(element.id, updatedData);
      });
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
        >
          Upload new video
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
    </div>
  );
};

export default VideoProperties;
