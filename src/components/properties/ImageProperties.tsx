
import { useRef, useState } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import RotationProperty from "./RotationProperty";

const ImageProperties = ({ element }: { element: DesignElement }) => {
  const { updateElement, handleImageUpload } = useDesignState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scaleValue, setScaleValue] = useState(100); // Default scale is 100%

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, { 
      src: e.target.value,
      dataUrl: undefined,
      file: undefined
    });
  };
  
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    handleImageUpload(element.id, file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageResize = (value: number[]) => {
    if (!element.originalSize) return;
    
    const scalePercentage = value[0];
    setScaleValue(scalePercentage);
    
    const scaleFactor = scalePercentage / 100;
    const newWidth = Math.round(element.originalSize.width * scaleFactor);
    const newHeight = Math.round(element.originalSize.height * scaleFactor);
    
    updateElement(element.id, {
      size: { width: newWidth, height: newHeight }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Upload Image</Label>
        <div className="mt-2 flex flex-col gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageFileSelect} 
            accept="image/*"
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={triggerFileInput}
            className="w-full flex items-center justify-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            {element.file ? "Change Image" : "Choose Image"}
          </Button>
          {element.file && (
            <p className="text-xs text-muted-foreground">
              {element.file.name}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-2">
        <Label>Or use Image URL</Label>
        <Input 
          value={element.src || ''} 
          onChange={handleImageUrlChange}
          placeholder="Enter image URL"
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          When using a URL, the image will initially use default dimensions. Upload local files for precise dimensions.
        </p>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <Label>Resize Image</Label>
          <span className="text-sm font-medium">{scaleValue}%</span>
        </div>
        <Slider
          value={[scaleValue]}
          min={10}
          max={200}
          step={1}
          onValueChange={handleImageResize}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>10%</span>
          <span>200%</span>
        </div>
        <div className="text-sm mt-2">
          {element.size?.width} × {element.size?.height} px
        </div>
      </div>
      
      {(element.dataUrl || element.src) && (
        <div className="mt-4 border rounded-md p-2 bg-background">
          <img 
            src={element.dataUrl || element.src} 
            alt="Preview" 
            className="w-full h-32 object-contain"
          />
        </div>
      )}
      
      <RotationProperty element={element} />
    </div>
  );
};

export default ImageProperties;
