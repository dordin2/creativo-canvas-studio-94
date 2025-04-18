import { useRef, useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import { getImageFromCache, estimateDataUrlSize } from "@/utils/imageUploader";
import { getRotation } from "@/utils/elementStyles";
import { toast } from "sonner";

const ImageProperties = ({
  element
}: {
  element: DesignElement;
}) => {
  const {
    updateElement,
    handleImageUpload,
    isGameMode,
    canvases,
    activeCanvasIndex,
    removeElement,
    addElement
  } = useDesignState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scaleValue, setScaleValue] = useState<number>(100);
  const [rotation, setRotation] = useState(getRotation(element));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageStats, setImageStats] = useState<{size: string, dimensions: string} | null>(null);
  const [imageSrc, setImageSrc] = useState<string | undefined>(element.dataUrl || element.src);
  const [thumbnailSrc, setThumbnailSrc] = useState<string | undefined>(element.thumbnailDataUrl);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = document.querySelector('.canvas-container');
      if (canvas) {
        setCanvasSize({
          width: canvas.clientWidth,
          height: canvas.clientHeight
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (element.originalSize && element.size && canvasSize.width && canvasSize.height) {
      const widthRatio = element.size.width / canvasSize.width;
      const heightRatio = element.size.height / canvasSize.height;
      const currentRatio = Math.max(widthRatio, heightRatio);
      const scale = Math.round(currentRatio * 100);
      setScaleValue(scale);
    }
  }, [element.originalSize, element.size, canvasSize]);

  useEffect(() => {
    const loadImages = async () => {
      if (element.cacheKey) {
        if (!imageSrc) {
          const cachedImage = await getImageFromCache(element.cacheKey);
          if (cachedImage) {
            console.log("ImageProperties - Recovered image from cache:", element.cacheKey);
            setImageSrc(cachedImage);
          }
        }
        
        if (!thumbnailSrc) {
          const cachedThumbnail = await getImageFromCache(element.cacheKey, true);
          if (cachedThumbnail) {
            console.log("ImageProperties - Recovered thumbnail from cache");
            setThumbnailSrc(cachedThumbnail);
          }
        }
      }
    };
    
    loadImages();
    
    if (imageSrc || element.src) {
      const size = imageSrc ? 
        estimateDataUrlSize(imageSrc) :
        0;
      
      let sizeStr = 'Unknown';
      if (size > 0) {
        sizeStr = size > 1024 * 1024 ? 
          `${(size / (1024 * 1024)).toFixed(2)}MB` : 
          `${(size / 1024).toFixed(2)}KB`;
      } else if (element.file) {
        sizeStr = element.file.size > 1024 * 1024 ? 
          `${(element.file.size / (1024 * 1024)).toFixed(2)}MB` : 
          `${(element.file.size / 1024).toFixed(2)}KB`;
      }
      
      const dimensions = element.originalSize ? 
        `${element.originalSize.width} × ${element.originalSize.height}px` :
        'Unknown';
      
      setImageStats({
        size: sizeStr,
        dimensions
      });
    }
  }, [element.id, element.cacheKey, imageSrc, thumbnailSrc, element.src, element.file, element.originalSize]);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    updateElement(element.id, {
      src: url,
      dataUrl: undefined,
      file: undefined
    });
    setImageSrc(url);
  };
  
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    console.log("ImageProperties - Selected file:", file.name, file.type, file.size);
    
    setImageLoaded(false);
    
    handleImageUpload(element.id, file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageResize = (value: number[]) => {
    if (!element.originalSize || !canvasSize.width || !canvasSize.height) return;
    
    const scalePercentage = value[0];
    setScaleValue(scalePercentage);
    
    const maxWidth = canvasSize.width;
    const maxHeight = canvasSize.height;
    
    const imageAspectRatio = element.originalSize.width / element.originalSize.height;
    const canvasAspectRatio = maxWidth / maxHeight;
    
    let targetWidth, targetHeight;
    if (imageAspectRatio > canvasAspectRatio) {
      targetWidth = maxWidth;
      targetHeight = maxWidth / imageAspectRatio;
    } else {
      targetHeight = maxHeight;
      targetWidth = maxHeight * imageAspectRatio;
    }
    
    const scaleFactor = scalePercentage / 100;
    const newWidth = Math.round(targetWidth * scaleFactor);
    const newHeight = Math.round(targetHeight * scaleFactor);
    
    updateElement(element.id, {
      size: {
        width: newWidth,
        height: newHeight
      }
    });
  };
  
  const handleRotationChange = (value: number[]) => {
    if (isGameMode) return;
    
    const newRotation = Math.round(value[0]);
    setRotation(newRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameMode) return;
    
    const inputValue = e.target.value;
    const newRotation = parseInt(inputValue) || 0;
    
    const boundedRotation = Math.max(-360, Math.min(360, newRotation));
    
    handleRotationChange([boundedRotation]);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const renderImagePreview = () => {
    const mainSrc = imageSrc || element.src;
    
    if (!mainSrc) {
      return (
        <div className="w-full h-32 flex items-center justify-center bg-muted rounded-md">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">No image</span>
        </div>
      );
    }
    
    return (
      <div className="mt-4 border rounded-md p-2 bg-background relative">
        {!imageLoaded && thumbnailSrc && (
          <img 
            src={thumbnailSrc} 
            alt="Preview loading" 
            className="w-full h-32 object-contain blur-[2px]" 
          />
        )}
        <img 
          src={mainSrc} 
          alt="Preview" 
          className={`w-full h-32 object-contain ${!imageLoaded ? 'opacity-0 absolute' : 'opacity-100'}`}
          onLoad={handleImageLoad}
          onError={(e) => {
            console.error("Image failed to load:", mainSrc ? "src exists" : "no src");
            e.currentTarget.src = "/placeholder.svg";
            setImageLoaded(true);
          }}
        />
      </div>
    );
  };
  
  const handleSetAsBackground = () => {
    if (element.type !== 'image' || !element.dataUrl) {
      toast.error('Cannot set background - only images can be set as background');
      return;
    }
    
    const currentCanvas = canvases[activeCanvasIndex];
    const backgroundElements = currentCanvas.elements.filter(el => el.type === 'background');
    backgroundElements.forEach(bg => removeElement(bg.id));
    
    addElement('background', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${element.dataUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0
      }
    });
    
    removeElement(element.id);
    
    toast.success('Image set as canvas background');
  };

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
          
          {imageStats && (
            <div className="text-xs text-muted-foreground mt-1">
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-medium">{imageStats.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Dimensions:</span>
                <span className="font-medium">{imageStats.dimensions}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <Label>Image Size</Label>
          <span className="text-sm font-medium">{scaleValue}%</span>
        </div>
        <Slider 
          value={[scaleValue]} 
          min={1} 
          max={100} 
          step={1} 
          onValueChange={handleImageResize} 
          className="mb-2" 
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>1%</span>
          <span>100%</span>
        </div>
        <div className="text-sm mt-2">
          {element.size?.width} × {element.size?.height} px
        </div>
      </div>
      
      {renderImagePreview()}
      
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
              onChange={handleInputChange}
              min={-360}
              max={360}
              className="w-24"
              disabled={isGameMode}
            />
            <span className="text-sm">degrees</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          onClick={handleSetAsBackground}
          variant="outline"
          className="w-full"
        >
          Set as Background
        </Button>
      </div>
    </div>;
};

export default ImageProperties;
