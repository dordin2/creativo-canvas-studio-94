import { useRef, useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, Info } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import RotationProperty from "./RotationProperty";
import { getImageFromCache } from "@/utils/imageUploader";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ImageProperties = ({
  element
}: {
  element: DesignElement;
}) => {
  const {
    updateElement,
    handleImageUpload,
    isGameMode,
    canvasRef
  } = useDesignState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scaleValue, setScaleValue] = useState(100); // Default scale is 100%
  const [recommendedFullscreenScale, setRecommendedFullscreenScale] = useState<number | null>(null);
  const [fullscreenScaleRatio, setFullscreenScaleRatio] = useState(1.6); // Default ratio

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

  // Calculate recommended fullscreen scale based on canvas and original image dimensions
  useEffect(() => {
    if (element.originalSize && canvasRef) {
      // Get current canvas dimensions
      const canvasWidth = canvasRef.clientWidth;
      const canvasHeight = canvasRef.clientHeight;
      
      // Get screen dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Calculate the aspect ratios
      const canvasAspectRatio = canvasWidth / canvasHeight;
      const screenAspectRatio = windowWidth / windowHeight;
      
      // Calculate the scaling factors for both modes based on both width and height
      const normalWidthScale = (canvasWidth / element.originalSize.width) * 100;
      const normalHeightScale = (canvasHeight / element.originalSize.height) * 100;
      
      const fullscreenWidthScale = (windowWidth / element.originalSize.width) * 100;
      const fullscreenHeightScale = (windowHeight / element.originalSize.height) * 100;
      
      // Use the smaller scale in each mode to ensure full coverage without overflow
      const normalScale = Math.min(normalWidthScale, normalHeightScale);
      const fullscreenScale = Math.min(fullscreenWidthScale, fullscreenHeightScale);
      
      // Calculate the ratio between fullscreen and normal scales with a 25% buffer (increased from 15% to 25%)
      // The larger buffer helps ensure the image fully covers the screen with no white space
      const ratio = (fullscreenScale / normalScale) * 1.25; // Increased from 1.15 to 1.25
      
      console.log("Scale calculation:", {
        canvasSize: `${canvasWidth}x${canvasHeight}`,
        windowSize: `${windowWidth}x${windowHeight}`,
        normalScale,
        fullscreenScale,
        ratio
      });
      
      setFullscreenScaleRatio(ratio);
      
      // Set the recommended fullscreen scale based on current scale and ratio
      const recommendedScale = Math.ceil(scaleValue * ratio);
      setRecommendedFullscreenScale(recommendedScale);
    }
  }, [element.originalSize, canvasRef, scaleValue, element.size]);

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

  const applyProportionalScale = () => {
    if (element.originalSize) {
      // Apply the proportional scale based on current scale and the ratio
      const fullscreenProportionalScale = Math.round(scaleValue * fullscreenScaleRatio);
      handleImageResize([fullscreenProportionalScale]);
      
      // Store the original scale for potential restoration
      updateElement(element.id, {
        metadata: {
          ...element.metadata,
          originalScale: scaleValue,
          fullscreenScale: fullscreenProportionalScale
        }
      });
      
      // Show a toast or console message to indicate the scale was applied
      console.log(`Applied proportional scale: ${scaleValue}% → ${fullscreenProportionalScale}%`);
    }
  };
  
  const getScaleLabel = () => {
    if (recommendedFullscreenScale) {
      const fullscreenPropScale = Math.round(scaleValue * fullscreenScaleRatio);
      return `Fill screen (${fullscreenPropScale}%)`;
    }
    return "Fill screen";
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
        originalSize: element.originalSize,
        metadata: element.metadata
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
        <div className="text-sm mt-2 flex items-center justify-between">
          <span>{element.size?.width} × {element.size?.height} px</span>
          
          <div className="flex gap-2">
            {recommendedFullscreenScale && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={applyProportionalScale}
                      className="flex items-center gap-1 h-7 px-2 text-xs"
                    >
                      <Info className="h-3 w-3" />
                      {getScaleLabel()}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set to {Math.round(scaleValue * fullscreenScaleRatio)}% to proportionally fill screen in fullscreen mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
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
      
      <RotationProperty element={element} />
    </div>;
};

export default ImageProperties;
