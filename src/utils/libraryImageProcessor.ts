import { DesignElement } from "@/types/designTypes";
import { compressImage, createThumbnail } from "@/utils/imageUploader";
import { calculateAppropriateImageSize } from "@/utils/elementUtils";
import { getThumbnailFromStorage, saveImageToStorage } from "./imageStorageDB";

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
const MAX_CACHE_ENTRIES = 50; // Increased from 30 to 50

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
  
  // Check if we have a thumbnail in storage
  const cachedThumbnail = await getThumbnailFromStorage(imageUrl);
  if (cachedThumbnail) {
    console.log("LibraryImageProcessor - Using cached thumbnail from storage:", imageUrl);
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
        dataUrl: cachedThumbnail || imageUrl, // Use cached thumbnail if available
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
    
    // Use a smaller image first if available (we'll load higher quality in background)
    img.src = imageUrl;
  });
};

// Create web worker for image processing to avoid blocking the main thread
const createImageProcessingWorker = () => {
  const workerCode = `
    self.onmessage = async function(e) {
      const { imageUrl, imageDataUrl } = e.data;
      
      try {
        // Create image element to process
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageDataUrl;
        });

        // Create canvas for processing
        const canvas = new OffscreenCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Create thumbnail (smaller version)
        const MAX_THUMB_SIZE = 300;
        const thumbRatio = Math.min(1, MAX_THUMB_SIZE / Math.max(img.width, img.height));
        const thumbWidth = Math.floor(img.width * thumbRatio);
        const thumbHeight = Math.floor(img.height * thumbRatio);
        
        const thumbCanvas = new OffscreenCanvas(thumbWidth, thumbHeight);
        const thumbCtx = thumbCanvas.getContext('2d');
        
        if (!thumbCtx) {
          throw new Error('Could not get thumbnail canvas context');
        }
        
        thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
        
        // Convert to blob and then to data URL
        const thumbBlob = await thumbCanvas.convertToBlob({type: 'image/jpeg', quality: 0.7});
        const dataBlob = await canvas.convertToBlob({type: 'image/jpeg', quality: 0.85});
        
        // Send data back to main thread
        self.postMessage({
          imageUrl,
          thumbBlob,
          dataBlob,
          success: true
        });
      } catch (error) {
        self.postMessage({
          imageUrl,
          error: String(error),
          success: false
        });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  
  // Clean up URL when done
  URL.revokeObjectURL(url);
  
  return worker;
};

// Lazy initialize worker
let imageProcessingWorker: Worker | null = null;

const getImageProcessingWorker = () => {
  if (!imageProcessingWorker) {
    imageProcessingWorker = createImageProcessingWorker();
  }
  return imageProcessingWorker;
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
      return; // Already processed this image
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
    
    // Try to use Web Worker for processing in background if supported
    if (window.Worker) {
      const worker = getImageProcessingWorker();
      
      worker.onmessage = async (e) => {
        const { thumbBlob, dataBlob, success, error, imageUrl: processedUrl } = e.data;
        
        if (!success || error) {
          console.error("Worker error:", error);
          return;
        }
        
        if (processedUrl !== imageUrl) {
          return; // This is a response for a different image
        }
        
        // Convert blobs to data URLs
        const thumbnailDataUrl = await blobToDataURL(thumbBlob);
        const processedDataUrl = await blobToDataURL(dataBlob);
        
        // Cache the thumbnail
        thumbnailCache.set(imageUrl, thumbnailDataUrl);
        
        // Save in IndexedDB for future use
        saveImageToStorage(
          imageUrl,  // Using URL as ID
          processedDataUrl,
          thumbnailDataUrl,
          {
            cacheKey: imageUrl,
            originalSize: {
              width: img.naturalWidth,
              height: img.naturalHeight
            }
          }
        );
        
        // Update the element with processed data
        onUpdate({
          dataUrl: processedDataUrl,
          thumbnailDataUrl
        });
        
        const endTime = performance.now();
        console.log(`LibraryImageProcessor - Background processing completed in ${Math.round(endTime - startTime)}ms`);
      };
      
      // Send image to worker for processing
      worker.postMessage({
        imageUrl,
        imageDataUrl
      });
      
    } else {
      // Fall back to processing on main thread if Web Workers aren't supported
      const [{ dataUrl: processedDataUrl }, thumbnailDataUrl] = await Promise.all([
        compressImage(imageDataUrl),
        createThumbnail(imageDataUrl)
      ]);
      
      // Cache the thumbnail
      thumbnailCache.set(imageUrl, thumbnailDataUrl);
      
      // Save in IndexedDB for future use
      saveImageToStorage(
        imageUrl,  // Using URL as ID
        processedDataUrl,
        thumbnailDataUrl,
        {
          cacheKey: imageUrl,
          originalSize: {
            width: img.naturalWidth,
            height: img.naturalHeight
          }
        }
      );
      
      // Update the element with processed data
      onUpdate({
        dataUrl: processedDataUrl,
        thumbnailDataUrl
      });
      
      const endTime = performance.now();
      console.log(`LibraryImageProcessor - Background processing completed in ${Math.round(endTime - startTime)}ms`);
    }
    
  } catch (error) {
    console.error('Background image processing error:', error);
  }
};

// Helper function to convert Blob to data URL
const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
