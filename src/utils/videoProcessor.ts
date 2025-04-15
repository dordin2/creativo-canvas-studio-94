
import { toast } from "sonner";
import { DesignElement } from "@/types/designTypes";

// Create a local cache to store video data with size limits
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB cache limit
const videoCache = new Map<string, string>();
let currentCacheSize = 0;

// Checks if cache has exceeded its limit and removes oldest entries if needed
const manageCacheSize = (newDataSize: number): void => {
  // If adding the new data would exceed the cache size limit
  if (currentCacheSize + newDataSize > MAX_CACHE_SIZE) {
    // Sort entries by access time to remove the oldest
    const entries = Array.from(videoCache.entries());
    
    // Remove entries until we have enough space
    while (currentCacheSize + newDataSize > MAX_CACHE_SIZE && entries.length > 0) {
      const [oldestKey, oldestValue] = entries.shift()!;
      videoCache.delete(oldestKey);
      currentCacheSize -= oldestValue.length;
      console.log(`videoProcessor - Removed item from cache, freed ${(oldestValue.length / 1024).toFixed(2)} KB`);
    }
  }
};

// Process and optimize video uploads
export const processVideoUpload = async (
  file: File, 
  onSuccess: (data: Partial<DesignElement>) => void
): Promise<void> => {
  if (!file.type.startsWith('video/')) {
    toast.error("Please upload a valid video file");
    return;
  }
  
  // Show loading toast
  const loadingToast = toast.loading("Processing video...");
  
  try {
    // We could implement video compression here, but browser-side video compression
    // is resource-intensive. For now, we'll just handle the video efficiently.
    
    // Create a smaller video preview if possible using the browser's capabilities
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result as string;
        
        // Manage cache size before adding new entry
        manageCacheSize(dataUrl.length);
        
        // Cache the video data with a unique identifier
        const cacheKey = `video_${file.name}_${file.size}_${Date.now()}`;
        videoCache.set(cacheKey, dataUrl);
        currentCacheSize += dataUrl.length;
        
        console.log("videoProcessor - Cache status:", {
          cacheItems: videoCache.size,
          cacheSize: `${(currentCacheSize / 1024 / 1024).toFixed(2)} MB`,
          maxSize: `${(MAX_CACHE_SIZE / 1024 / 1024).toFixed(2)} MB`
        });
        
        // Create a new video element to get dimensions
        const video = document.createElement('video');
        video.preload = 'metadata'; // Only load metadata for efficiency
        
        video.onloadedmetadata = () => {
          // Close loading toast
          toast.dismiss(loadingToast);
          
          // Get dimensions
          const naturalWidth = video.videoWidth;
          const naturalHeight = video.videoHeight;
          
          // Calculate scaled dimensions (max 300px)
          const MAX_DIMENSION = 300;
          let scaledWidth = naturalWidth;
          let scaledHeight = naturalHeight;
          
          // Scale down only if larger than target size
          if (naturalWidth > MAX_DIMENSION || naturalHeight > MAX_DIMENSION) {
            if (naturalWidth > naturalHeight) {
              scaledWidth = MAX_DIMENSION;
              scaledHeight = (naturalHeight / naturalWidth) * MAX_DIMENSION;
            } else {
              scaledHeight = MAX_DIMENSION;
              scaledWidth = (naturalWidth / naturalHeight) * MAX_DIMENSION;
            }
          }
          
          // Calculate file size in MB for user feedback
          const fileSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100;
          
          // Provide the processed video data
          onSuccess({ 
            dataUrl, 
            src: undefined,
            file: file,
            cacheKey,
            size: {
              width: scaledWidth,
              height: scaledHeight
            },
            originalSize: {
              width: naturalWidth,
              height: naturalHeight
            }
          });
          
          toast.success(`Video processed (${fileSizeMB} MB)`);
        };
        
        video.onerror = () => {
          toast.dismiss(loadingToast);
          toast.error("Failed to load video dimensions");
        };
        
        video.src = dataUrl;
      }
    };
    
    reader.onerror = () => {
      toast.dismiss(loadingToast);
      toast.error("Failed to load video");
    };
    
    reader.readAsDataURL(file);
  } catch (error) {
    toast.dismiss(loadingToast);
    console.error("Error processing video:", error);
    toast.error("Failed to process video");
  }
};

/**
 * Retrieves a video from the cache by its cache key
 */
export const getVideoFromCache = (cacheKey: string): string | undefined => {
  return videoCache.get(cacheKey);
};

/**
 * Stores a video in the cache with size management
 */
export const storeVideoInCache = (cacheKey: string, dataUrl: string): void => {
  // Manage cache size before adding
  manageCacheSize(dataUrl.length);
  
  // Add to cache
  videoCache.set(cacheKey, dataUrl);
  currentCacheSize += dataUrl.length;
};
