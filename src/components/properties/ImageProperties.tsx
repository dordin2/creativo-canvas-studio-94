import { useRef, useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import { getImageFromCache } from "@/utils/imageUploader";
import { getRotation } from "@/utils/elementStyles";

const ImageProperties = ({
  element
}: {
  element: DesignElement;
}) => {
  const {
    updateElement,
    handleImageUpload,
    isGameMode
  } = useDesignState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scaleValue, setScaleValue] = useState(100); // Default scale is 100%
  const [rotation, setRotation] = useState(getRotation(element));

  // Initialize scale value based on element's current size when component mounts
  useEffect(() => {
    if (element.originalSize && element.size) {
      const currentScale = Math.round((element.size.width / element.originalSize.width) * 100);
      setScaleValue(currentScale || 100);
    }
  }, [element.id, element.originalSize, element.size]);

  useEffect(() => {
    // Try to recover image from cache if we have a cache key but no dataUrl
    if (element.cacheKey && !element.dataUrl) {
      const cachedImage = getImageFromCache(element.cacheKey);
      if (cachedImage) {
        console.log("ImageProperties - Recovered image from cache:", element.cacheKey);
        updateElement(element.id, {
          dataUrl: cachedImage
        });
      }
    }
  }, [element.id, element.cacheKey, element.dataUrl]);

  // Keep rotation state in sync with element
  useEffect(() => {
    setRotation(getRotation(element));
  }, [element]);

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
    console.log("ImageProperties - Selected file:", file.name, file.type, file.size);
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
      size: {
        width: newWidth,
        height: newHeight
      }
    });
  };
  
  const handleRotationChange = (value: number[]) => {
    if (isGameMode) return; // No rotation in game mode
    
    const newRotation = Math.round(value[0]);
    setRotation(newRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  };

  const handleRotationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameMode) return;
    
    // Parse input and handle non-numeric input
    const inputValue = e.target.value;
    const newRotation = parseInt(inputValue) || 0;
    
    // Keep rotation between -360 and 360 degrees
    const boundedRotation = Math.max(-360, Math.min(360, newRotation));
    
    setRotation(boundedRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${boundedRotation}deg)` }
    });
  };
  
  useEffect(() => {
    // Log image data for debugging
    if (element.type === 'image') {
      console.log("ImageProperties - Current image data:", {
        dataUrl: element.dataUrl ? `${element.dataUrl.substring(0, 30)}...` : "missing",
        dataUrlLength: element.dataUrl?.length || 0,
        src: element.src,
        fileExists: !!element.file,
        fileName: element.file?.name,
        cacheKey: element.cacheKey,
        originalSize: element.originalSize
      });
    }
  }, [element]);
  
  return <div className="space-y-4">
      <div>
        <Label>Upload Image</Label>
        <div className="mt-2 flex flex-col gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImageFileSelect} accept="image/*" className="hidden" />
          <Button variant="outline" onClick={triggerFileInput} className="w-full flex items-center justify-center">
            <Upload className="h-4 w-4 mr-2" />
            {element.file ? "Change Image" : "Choose Image"}
          </Button>
          {element.file && <p className="text-xs text-muted-foreground">
              {element.file.name}
          </p>}
          {element.fileMetadata && !element.file && <p className="text-xs text-muted-foreground">
              {element.fileMetadata.name} (duplicated)
          </p>}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <Label>Resize Image</Label>
          <span className="text-sm font-medium">{scaleValue}%</span>
        </div>
        <Slider value={[scaleValue]} min={10} max={200} step={1} onValueChange={handleImageResize} className="mb-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>10%</span>
          <span>200%</span>
        </div>
        <div className="text-sm mt-2">
          {element.size?.width} × {element.size?.height} px
        </div>
      </div>
      
      {(element.dataUrl || element.src) && <div className="mt-4 border rounded-md p-2 bg-background">
          <img 
            src={element.dataUrl || element.src} 
            alt="Preview" 
            className="w-full h-32 object-contain" 
            onError={(e) => {
              console.error("Image failed to load:", element.dataUrl ? "dataUrl exists" : "no dataUrl", element.src);
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>}
      
      <div className="space-y-4">
        <Label>Rotation</Label>
        <div className="space-y-2">
          <Slider
            value={[rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={handleRotationChange}
            disabled={isGameMode}
            className="my-4"
          />
          <div className="flex gap-4 items-center">
            <Input 
              type="number" 
              value={rotation}
              onChange={handleRotationInputChange}
              min={-360}
              max={360}
              className="w-24"
              disabled={isGameMode}
            />
            <span className="text-sm">degrees</span>
          </div>
        </div>
      </div>
    </div>;
};

export default ImageProperties;
