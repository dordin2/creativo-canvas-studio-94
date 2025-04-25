
import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { DesignElement } from "@/types/designTypes";
import { getImageFromCache } from "@/utils/imageUploader";

interface ImagePreviewProps {
  element: DesignElement;
}

const ImagePreview = ({ element }: ImagePreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(
    element.dataUrl || element.src
  );
  const [thumbnailSrc, setThumbnailSrc] = useState<string | undefined>(
    element.thumbnailDataUrl
  );

  useEffect(() => {
    const loadImages = async () => {
      if (element.cacheKey) {
        if (!imageSrc) {
          const cachedImage = await getImageFromCache(element.cacheKey);
          if (cachedImage) {
            console.log(
              "ImagePreview - Recovered image from cache:",
              element.cacheKey
            );
            setImageSrc(cachedImage);
          }
        }

        if (!thumbnailSrc) {
          const cachedThumbnail = await getImageFromCache(element.cacheKey, true);
          if (cachedThumbnail) {
            console.log("ImagePreview - Recovered thumbnail from cache");
            setThumbnailSrc(cachedThumbnail);
          }
        }
      }
    };

    loadImages();
  }, [element.cacheKey, imageSrc, thumbnailSrc]);

  if (!imageSrc && !element.src) {
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
        src={imageSrc || element.src}
        alt="Preview"
        className={`w-full h-32 object-contain ${
          !imageLoaded ? "opacity-0 absolute" : "opacity-100"
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          console.error(
            "Image failed to load:",
            imageSrc ? "src exists" : "no src"
          );
          e.currentTarget.src = "/placeholder.svg";
          setImageLoaded(true);
        }}
      />
    </div>
  );
};

export default ImagePreview;
