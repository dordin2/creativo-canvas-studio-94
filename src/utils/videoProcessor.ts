
import { toast } from "sonner";
import { DesignElement } from "@/types/designTypes";

// Create a local cache to store video data
const videoCache = new Map<string, string>();

export const processVideoUpload = (
  file: File, 
  onSuccess: (data: Partial<DesignElement>) => void
): void => {
  if (!file.type.startsWith('video/')) {
    toast.error("Please upload a valid video file");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      const dataUrl = e.target.result as string;
      
      // Cache the video data with a unique identifier
      const cacheKey = `video_${file.name}_${file.size}_${file.lastModified}`;
      videoCache.set(cacheKey, dataUrl);
      
      // Create a new video element to get the natural dimensions
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        // Get the natural dimensions of the uploaded video
        const naturalWidth = video.videoWidth;
        const naturalHeight = video.videoHeight;
        
        // Calculate scaled dimensions to make the video start at a reasonable size
        // Max dimension (width or height) will be 300px
        const MAX_DIMENSION = 300;
        let scaledWidth = naturalWidth;
        let scaledHeight = naturalHeight;
        
        // Scale down only if the video is larger than our target size
        if (naturalWidth > MAX_DIMENSION || naturalHeight > MAX_DIMENSION) {
          if (naturalWidth > naturalHeight) {
            // Landscape orientation
            scaledWidth = MAX_DIMENSION;
            scaledHeight = (naturalHeight / naturalWidth) * MAX_DIMENSION;
          } else {
            // Portrait or square orientation
            scaledHeight = MAX_DIMENSION;
            scaledWidth = (naturalWidth / naturalHeight) * MAX_DIMENSION;
          }
        }
        
        console.log("videoProcessor - Processing video:", {
          fileName: file.name,
          fileSize: file.size,
          cacheKey,
          dataUrlLength: dataUrl.length,
          dimensions: `${naturalWidth}x${naturalHeight}`,
          scaledDimensions: `${scaledWidth}x${scaledHeight}`
        });
        
        // Provide the processed video data
        onSuccess({ 
          dataUrl, 
          src: undefined, // Clear the external URL when using a local file
          file: file, // Store the original file reference
          cacheKey, // Store the cache key for later retrieval
          size: {
            width: scaledWidth,
            height: scaledHeight
          },
          originalSize: {  // Store original size for scaling
            width: naturalWidth,
            height: naturalHeight
          }
        });
        
        toast.success("Video uploaded successfully");
      };
      
      video.onerror = () => {
        toast.error("Failed to load video dimensions");
      };
      
      // Set the source to the data URL to trigger the onload event
      video.src = dataUrl;
    }
  };
  
  reader.onerror = () => {
    toast.error("Failed to load video");
  };
  
  reader.readAsDataURL(file);
};

/**
 * Retrieves a video from the cache by its cache key
 */
export const getVideoFromCache = (cacheKey: string): string | undefined => {
  return videoCache.get(cacheKey);
};

/**
 * Stores a video in the cache
 */
export const storeVideoInCache = (cacheKey: string, dataUrl: string): void => {
  videoCache.set(cacheKey, dataUrl);
};
