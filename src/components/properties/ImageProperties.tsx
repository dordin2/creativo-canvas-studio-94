
import { useRef, useState, useEffect } from "react";
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, Image as ImageIcon, Cloud, CloudOff, Loader2 } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";
import { getImageFromCache, estimateDataUrlSize } from "@/utils/imageUploader";
import { getImageFromCloud, migrateImageToCloud, canUseCloudStorage } from "@/utils/cloudStorage";
import { getRotation } from "@/utils/elementStyles";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageStats, setImageStats] = useState<{size: string} | null>(null);
  const [imageSrc, setImageSrc] = useState<string | undefined>(element.dataUrl || element.src);
  const [thumbnailSrc, setThumbnailSrc] = useState<string | undefined>(element.thumbnailDataUrl);
  const [canMigrateToCloud, setCanMigrateToCloud] = useState(false);
  const [isMigratingToCloud, setIsMigratingToCloud] = useState(false);

  useEffect(() => {
    if (element.originalSize && element.size) {
      const currentScale = Math.round((element.size.width / element.originalSize.width) * 100);
      setScaleValue(currentScale || 100);
    }
    
    setRotation(getRotation(element));
  }, [element.id, element.originalSize, element.size, element]);

  useEffect(() => {
    const loadImages = async () => {
      // First try to get from cloud storage if applicable
      if (element.storageType === 'cloud' && element.cloudStorage) {
        const cloudImages = await getImageFromCloud(element);
        if (cloudImages.dataUrl) {
          setImageSrc(cloudImages.dataUrl);
          setImageLoaded(true);
        }
        if (cloudImages.thumbnailDataUrl) {
          setThumbnailSrc(cloudImages.thumbnailDataUrl);
        }
        return;
      }
      
      // Fall back to local storage
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
      
      setImageStats({
        size: size > 0 ? 
          `${(size / (1024 * 1024)).toFixed(2)}MB` : 
          `${(size / 1024).toFixed(2)}KB`
      });
    }
    
    // Check if we can migrate to cloud
    const checkCloudMigration = async () => {
      const canUse = await canUseCloudStorage();
      setCanMigrateToCloud(
        canUse && 
        element.storageType !== 'cloud' && 
        !!element.dataUrl
      );
    };
    
    checkCloudMigration();
  }, [element.id, element.cacheKey, imageSrc, thumbnailSrc, element.src, element.file, element.cloudStorage, element.storageType, element.dataUrl]);

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

  const handleMigrateToCloud = async () => {
    setIsMigratingToCloud(true);
    
    try {
      const migratedElement = await migrateImageToCloud(element);
      
      if (migratedElement) {
        updateElement(element.id, {
          cloudStorage: migratedElement.cloudStorage,
          storageType: 'cloud'
        });
        
        toast.success("Image migrated to cloud storage");
        setCanMigrateToCloud(false);
      } else {
        toast.error("Failed to migrate to cloud storage");
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Error migrating to cloud storage");
    } finally {
      setIsMigratingToCloud(false);
    }
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
        {element.storageType === 'cloud' && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-2 right-2 bg-white/80"
          >
            <Cloud className="w-3 h-3 mr-1" /> Cloud
          </Badge>
        )}
      </div>
    );
  };
  
  return <div className="space-y-4">
    <div>
      <Label>Image</Label>
      <div className="mt-2 flex flex-col gap-2">
        <input type="file" ref={fileInputRef} onChange={handleImageFileSelect} accept="image/*" className="hidden" />
        <Button variant="outline" onClick={triggerFileInput} className="w-full flex items-center justify-center gap-2">
          <Upload className="h-4 w-4" />
          {element.file ? "Change Image" : "Choose Image"}
        </Button>
        {element.file && <p className="text-xs text-muted-foreground">
          {element.file.name}
        </p>}
        {element.fileMetadata && !element.file && <p className="text-xs text-muted-foreground">
          {element.fileMetadata.name} {element.storageType === 'cloud' ? '(cloud)' : '(local)'}
        </p>}
        
        {imageStats && (
          <div className="text-xs text-muted-foreground mt-1">
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-medium">{imageStats.size}</span>
            </div>
            {canMigrateToCloud && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full text-xs h-6 flex items-center gap-1" 
                onClick={handleMigrateToCloud}
                disabled={isMigratingToCloud}
              >
                {isMigratingToCloud ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Cloud className="w-3 h-3 mr-1" />
                )}
                {isMigratingToCloud ? "Migrating..." : "Migrate to cloud storage"}
              </Button>
            )}
          </div>
        )}
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
  </div>;
};

export default ImageProperties;
