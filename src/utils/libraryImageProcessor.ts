import { DesignElement } from "@/types/designTypes";
import { compressImage, createThumbnail } from "@/utils/imageUploader";
import { calculateAppropriateImageSize } from "@/utils/elementUtils";

// Cache for library images to avoid reprocessing the same image multiple times
const imageDataCache = new Map<string, {
  dataUrl: string;
  size: { width: number; height: number };
  originalSize: { width: number; height: number };
  timestamp: number;
}>();

// Cache for thumbnails
const thumbnailCache = new Map<string, string>();

// Maximum number of entries to keep in the cache
const MAX_CACHE_ENTRIES = 30;

// Clean up old cache entries
const cleanupCache = () => {
  if (imageDataCache.size > MAX_CACHE_ENTRIES) {
    // Get all entries and sort by timestamp (oldest first)
    const entries = Array.from(imageDataCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
    // Remove the oldest entries until we're under the limit
    while (entries.length > MAX_CACHE_ENTRIES) {
      const [key] = entries.shift()!;
      imageDataCache.delete(key);
      thumbnailCache.delete(key);
    }
  }
};

interface InitialImageData {
  dataUrl: string;
  size: {
    width: number;
    height: number;
  };
  originalSize: {
    width: number;
    height: number;
  };
}

export const getInitialLibraryImageData = async (
  imageUrl: string,
  canvasWidth?: number,
  canvasHeight?: number
): Promise<InitialImageData> => {
  // Check the cache first
  if (imageDataCache.has(imageUrl)) {
    console.log("LibraryImageProcessor - Using cached image data for:", imageUrl);
    // Update timestamp to keep this entry "fresh"
    const cachedData = imageDataCache.get(imageUrl)!;
    cachedData.timestamp = Date.now();
    return cachedData;
  }
  
  return new Promise((resolve, reject) => {
    console.log("LibraryImageProcessor - Loading new image:", imageUrl);
    const startTime = performance.now();
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Get original dimensions
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      
      // Calculate appropriate size based on canvas dimensions
      const appropriateSize = calculateAppropriateImageSize(
        width,
        height,
        canvasWidth || window.innerWidth * 0.7,
        canvasHeight || window.innerHeight * 0.7
      );
      
      // We don't immediately create a data URL to speed up initial loading
      // Just use the original URL for rapid display
      const result = {
        dataUrl: imageUrl, // Initially just use the URL
        size: appropriateSize,
        originalSize: {
          width,
          height
        },
        timestamp: Date.now()
      };
      
      // Store in cache for future use
      imageDataCache.set(imageUrl, result);
      cleanupCache();
      
      const endTime = performance.now();
      console.log(`LibraryImageProcessor - Initial load time: ${Math.round(endTime - startTime)}ms`);
      
      resolve(result);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

export const processLibraryImageInBackground = async (
  imageUrl: string,
  element: DesignElement,
  onUpdate: (updates: Partial<DesignElement>) => void
): Promise<void> => {
  try {
    // Check if we already have a thumbnail in cache
    if (thumbnailCache.has(imageUrl)) {
      console.log("LibraryImageProcessor - Using cached thumbnail for:", imageUrl);
      onUpdate({
        thumbnailDataUrl: thumbnailCache.get(imageUrl)
      });
    }
    
    const startTime = performance.now();
    console.log("LibraryImageProcessor - Starting background processing for:", imageUrl);
    
    // Download and convert the image to data URL for local processing
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    // Create canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    ctx.drawImage(img, 0, 0);
    
    // Get the image data URL for processing
    const imageDataUrl = canvas.toDataURL();
    
    // Process image and create thumbnail in parallel
    const [{ dataUrl: processedDataUrl }, thumbnailDataUrl] = await Promise.all([
      compressImage(imageDataUrl),
      createThumbnail(imageDataUrl)
    ]);
    
    // Cache the thumbnail
    thumbnailCache.set(imageUrl, thumbnailDataUrl);
    
    // Update the element with processed data
    onUpdate({
      dataUrl: processedDataUrl,
      thumbnailDataUrl
    });
    
    const endTime = performance.now();
    console.log(`LibraryImageProcessor - Background processing completed in ${Math.round(endTime - startTime)}ms`);
    
  } catch (error) {
    console.error('Background image processing error:', error);
  }
};
