import { toast } from "sonner";
import { DesignElement } from "@/types/designTypes";
import { 
  saveImageToStorage, 
  getImageFromStorage, 
  getThumbnailFromStorage,
  pruneImageStorage,
  deleteImageFromStorage
} from "./imageStorageDB";

// Default image processing settings
const IMAGE_QUALITY = 0.85; // Default quality setting for WebP compression
const MAX_DIMENSION = 1200; // Default max dimension for full images
const THUMBNAIL_DIMENSION = 150; // Thumbnail size for lightweight previews
const WEBP_SUPPORT = !!window.createImageBitmap; // Check for WebP support
const MAX_CANVAS_IMAGE_SIZE_PERCENT = 0.3; // Maximum percentage of canvas dimension an image should initially occupy

// Memory cache for rapidly accessing recently used images
class ImageMemoryCache {
  private cache: Map<string, string> = new Map();
  private thumbnailCache: Map<string, string> = new Map();
  private cacheSize: number = 0;
  private readonly MAX_CACHE_SIZE = 20 * 1024 * 1024; // 20MB in-memory cache limit
  
  set(key: string, dataUrl: string, isThumbnail: boolean = false): void {
    const targetCache = isThumbnail ? this.thumbnailCache : this.cache;
    const dataSize = this.getDataUrlSize(dataUrl);
    
    // Check if we need to evict items from cache
    if (this.cacheSize + dataSize > this.MAX_CACHE_SIZE) {
      this.evictOldestEntries(dataSize);
    }
    
    targetCache.set(key, dataUrl);
    this.cacheSize += dataSize;
    
    console.log(`ImageMemoryCache - Added image to ${isThumbnail ? 'thumbnail' : 'main'} cache:`, {
      key,
      size: (dataSize / 1024).toFixed(2) + 'KB',
      totalCacheSize: (this.cacheSize / 1024 / 1024).toFixed(2) + 'MB'
    });
  }
  
  get(key: string, thumbnail: boolean = false): string | undefined {
    return thumbnail ? this.thumbnailCache.get(key) : this.cache.get(key);
  }
  
  private getDataUrlSize(dataUrl: string): number {
    // Approximate size calculation: base64 is ~4/3 of binary size
    const base64Length = dataUrl.substring(dataUrl.indexOf(',') + 1).length;
    return Math.ceil(base64Length * 0.75);
  }
  
  private evictOldestEntries(requiredSpace: number): void {
    let freedSpace = 0;
    
    // First try to evict thumbnails
    for (const [key, dataUrl] of this.thumbnailCache) {
      const size = this.getDataUrlSize(dataUrl);
      this.thumbnailCache.delete(key);
      this.cacheSize -= size;
      freedSpace += size;
      
      if (freedSpace >= requiredSpace) {
        console.log("ImageMemoryCache - Evicted thumbnails to free space:", 
                   (freedSpace / 1024).toFixed(2) + 'KB');
        return;
      }
    }
    
    // If needed, evict from main cache
    const entries = Array.from(this.cache.entries());
    for (const [key, dataUrl] of entries) {
      const size = this.getDataUrlSize(dataUrl);
      this.cache.delete(key);
      this.cacheSize -= size;
      freedSpace += size;
      
      console.log("ImageMemoryCache - Evicted image from cache:", key);
      
      if (freedSpace >= requiredSpace) {
        console.log("ImageMemoryCache - Total freed space:", 
                   (freedSpace / 1024).toFixed(2) + 'KB');
        return;
      }
    }
  }
}

// Initialize the memory cache
const memoryCache = new ImageMemoryCache();

/**
 * Compresses an image to WebP format with the specified quality
 */
async function compressImageToWebP(
  imageDataUrl: string, 
  quality: number = IMAGE_QUALITY,
  maxWidth: number = MAX_DIMENSION,
  maxHeight: number = MAX_DIMENSION
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Calculate scaled dimensions while maintaining aspect ratio
      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;
      
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        if (targetWidth / targetHeight > maxWidth / maxHeight) {
          // Width constrained
          targetHeight = Math.round((targetHeight / targetWidth) * maxWidth);
          targetWidth = maxWidth;
        } else {
          // Height constrained
          targetWidth = Math.round((targetWidth / targetHeight) * maxHeight);
          targetHeight = maxHeight;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Enable smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      // Try to convert to WebP with specified quality
      try {
        if (WEBP_SUPPORT) {
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          resolve({ 
            dataUrl: webpDataUrl, 
            width: targetWidth, 
            height: targetHeight 
          });
        } else {
          // Fallback to JPEG if WebP is not supported
          const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ 
            dataUrl: jpegDataUrl, 
            width: targetWidth, 
            height: targetHeight 
          });
        }
      } catch (err) {
        console.error('WebP/JPEG conversion failed:', err);
        reject(new Error('Image compression failed'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = imageDataUrl;
  });
}

/**
 * Creates a smaller thumbnail version of the image
 */
async function createThumbnail(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Calculate thumbnail dimensions (maintaining aspect ratio)
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let thumbWidth, thumbHeight;
      
      if (aspectRatio > 1) {
        // Landscape
        thumbWidth = THUMBNAIL_DIMENSION;
        thumbHeight = THUMBNAIL_DIMENSION / aspectRatio;
      } else {
        // Portrait or square
        thumbHeight = THUMBNAIL_DIMENSION;
        thumbWidth = THUMBNAIL_DIMENSION * aspectRatio;
      }
      
      canvas.width = thumbWidth;
      canvas.height = thumbHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Enable smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw scaled image
      ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
      
      // Convert to WebP with higher compression for thumbnails
      try {
        if (WEBP_SUPPORT) {
          const thumbnailDataUrl = canvas.toDataURL('image/webp', 0.7);
          resolve(thumbnailDataUrl);
        } else {
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(thumbnailDataUrl);
        }
      } catch (err) {
        console.error('Thumbnail creation failed:', err);
        reject(new Error('Failed to create thumbnail'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail creation'));
    };
    
    img.src = imageDataUrl;
  });
}

/**
 * Calculates a scaled size for an image that's appropriate for the canvas dimensions
 * This ensures large images don't immediately take up the whole canvas on upload
 */
function calculateAppropriateImageSize(
  originalWidth: number, 
  originalHeight: number, 
  canvasWidth: number = window.innerWidth * 0.7, // Approximate canvas width if not provided
  canvasHeight: number = window.innerHeight * 0.7 // Approximate canvas height if not provided
): { width: number; height: number } {
  // Calculate the maximum dimensions based on canvas size and our target percentage
  const maxCanvasWidth = canvasWidth * MAX_CANVAS_IMAGE_SIZE_PERCENT;
  const maxCanvasHeight = canvasHeight * MAX_CANVAS_IMAGE_SIZE_PERCENT;
  
  // Start with original dimensions
  let targetWidth = originalWidth;
  let targetHeight = originalHeight;
  
  // Always scale down to our target maximum canvas percentage, regardless of original size
  // This ensures consistency in how images appear when first uploaded
  const widthRatio = maxCanvasWidth / targetWidth;
  const heightRatio = maxCanvasHeight / targetHeight;
  
  // Use the smaller ratio to ensure the image fits within constraints
  const ratio = Math.min(widthRatio, heightRatio);
  
  // Apply the scaling
  targetWidth = Math.round(targetWidth * ratio);
  targetHeight = Math.round(targetHeight * ratio);
  
  console.log("imageUploader - Image scaled to fit canvas:", {
    originalSize: `${originalWidth}x${originalHeight}`,
    scaledSize: `${targetWidth}x${targetHeight}`,
    scaleFactor: ratio.toFixed(2),
    maxDimensions: `${maxCanvasWidth}x${maxCanvasHeight}`
  });
  
  return { width: targetWidth, height: targetHeight };
}

export const processImageUpload = (
  file: File, 
  onSuccess: (data: Partial<DesignElement>) => void,
  canvasWidth?: number,
  canvasHeight?: number
): void => {
  if (!file.type.startsWith('image/')) {
    toast.error("Please upload a valid image file");
    return;
  }
  
  // Show loading toast
  const loadingToast = toast.loading("Processing image...");
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    if (e.target?.result) {
      try {
        const originalDataUrl = e.target.result as string;
        
        // Compress image to WebP/JPEG
        const { dataUrl: compressedDataUrl, width, height } = 
          await compressImageToWebP(originalDataUrl);
        
        // Create thumbnail for lightweight previews
        const thumbnailDataUrl = await createThumbnail(compressedDataUrl);
        
        // Calculate an appropriate display size based on canvas dimensions
        // We ensure this is always applied, regardless of image size
        const appropriateSize = calculateAppropriateImageSize(
          width, 
          height, 
          canvasWidth || window.innerWidth * 0.7, 
          canvasHeight || window.innerHeight * 0.7
        );
        
        // Generate unique cache key
        const cacheKey = `img_${file.name}_${Date.now()}_${file.size}`;
        
        // Store in memory cache for immediate access
        memoryCache.set(cacheKey, compressedDataUrl);
        memoryCache.set(`${cacheKey}_thumbnail`, thumbnailDataUrl, true);
        
        // Store in IndexedDB for persistent storage
        const elementId = `temp_${cacheKey}`; // Temporary ID until element is created
        await saveImageToStorage(
          elementId,
          compressedDataUrl,
          thumbnailDataUrl,
          {
            fileMetadata: {
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: file.lastModified
            },
            originalSize: {  
              width,
              height
            },
            cacheKey
          }
        );
        
        // Log compression results
        const originalSize = Math.round(originalDataUrl.length / 1024);
        const compressedSize = Math.round(compressedDataUrl.length / 1024);
        const compressionRatio = Math.round((compressedSize / originalSize) * 100);
        
        console.log("imageUploader - Compression results:", {
          originalSize: `${originalSize}KB`,
          compressedSize: `${compressedSize}KB`,
          compressionRatio: `${compressionRatio}%`,
          spaceReduction: `${originalSize - compressedSize}KB (${100 - compressionRatio}%)`,
          originalDimensions: `${width}x${height}px`,
          displayDimensions: `${appropriateSize.width}x${appropriateSize.height}px`
        });
        
        // Clear loading toast
        toast.dismiss(loadingToast);
        
        // Return processed image data
        onSuccess({ 
          dataUrl: compressedDataUrl, 
          thumbnailDataUrl, 
          src: undefined, 
          file: file, 
          cacheKey, 
          size: appropriateSize,  // Use the appropriate scaled size
          originalSize: {  
            width,
            height
          }
        });
        
        // Run pruning operation in background to manage storage size
        pruneImageStorage().catch(err => {
          console.error("Failed to prune image storage:", err);
        });
        
        toast.success("Image optimized and uploaded");
      } catch (error) {
        console.error("Image processing error:", error);
        toast.dismiss(loadingToast);
        toast.error("Failed to optimize image");
      }
    }
  };
  
  reader.onerror = () => {
    toast.dismiss(loadingToast);
    toast.error("Failed to load image");
  };
  
  reader.readAsDataURL(file);
};

/**
 * Updates the element ID in storage after the element has been created
 */
export const updateImageElementId = async (tempId: string, permanentId: string): Promise<void> => {
  try {
    // Load image data from temporary ID
    const imageData = await getImageFromStorage(tempId);
    const thumbnailData = await getThumbnailFromStorage(tempId);
    
    if (imageData && thumbnailData) {
      // Get metadata from the temporary ID
      const metadata = await getImageFromStorage(`metadata_${tempId}`);
      const metadataObj = metadata ? JSON.parse(metadata) : {};
      
      // Save with permanent ID
      await saveImageToStorage(
        permanentId,
        imageData,
        thumbnailData,
        metadataObj
      );
      
      // Remove temporary data
      deleteImageFromStorage(tempId);
    }
  } catch (error) {
    console.error("Failed to update image element ID:", error);
  }
};

/**
 * Retrieves an image from storage (first tries memory cache, then IndexedDB)
 */
export const getImageFromCache = async (
  cacheKey: string, 
  thumbnail: boolean = false
): Promise<string | undefined> => {
  // First try memory cache
  const cachedImage = memoryCache.get(cacheKey, thumbnail);
  if (cachedImage) {
    return cachedImage;
  }
  
  // Then try persistent storage
  try {
    const storageKey = thumbnail ? `${cacheKey}_thumbnail` : cacheKey;
    const imageData = thumbnail ? 
      await getThumbnailFromStorage(storageKey) : 
      await getImageFromStorage(storageKey);
    
    if (imageData) {
      // Store in memory cache for future access
      memoryCache.set(cacheKey, imageData, thumbnail);
      return imageData;
    }
  } catch (error) {
    console.error("Error retrieving image from storage:", error);
  }
  
  return undefined;
};

/**
 * Stores an image in the cache
 */
export const storeImageInCache = (
  cacheKey: string, 
  dataUrl: string, 
  isThumbnail: boolean = false
): void => {
  memoryCache.set(cacheKey, dataUrl, isThumbnail);
};

/**
 * Estimates the size of a data URL in bytes
 */
export const estimateDataUrlSize = (dataUrl: string | undefined): number => {
  if (!dataUrl) return 0;
  
  // Base64 is ~4/3 of binary size
  const base64Length = dataUrl.substring(dataUrl.indexOf(',') + 1).length;
  return Math.ceil(base64Length * 0.75);
};

/**
 * Deletes an image from all storage layers
 */
export const deleteImageFromCache = async (cacheKey: string): Promise<void> => {
  try {
    // Remove from memory cache
    memoryCache.get(cacheKey)?.length && memoryCache.set(cacheKey, "");
    memoryCache.get(`${cacheKey}_thumbnail`)?.length && memoryCache.set(`${cacheKey}_thumbnail`, "");
    
    // Remove from persistent storage
    await deleteImageFromStorage(cacheKey);
    await deleteImageFromStorage(`${cacheKey}_thumbnail`);
  } catch (error) {
    console.error("Error deleting image from cache:", error);
  }
};

/**
 * Process library images
 */
export const processLibraryImage = async (
  imageUrl: string,
  canvasWidth?: number,
  canvasHeight?: number
): Promise<Partial<DesignElement>> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = async () => {
      try {
        // Get original dimensions
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        
        // Draw image to canvas to get data URL
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Create thumbnail
        const thumbnailDataUrl = await createThumbnail(canvas.toDataURL());
        
        // Calculate appropriate size based on canvas dimensions
        const appropriateSize = calculateAppropriateImageSize(
          width,
          height,
          canvasWidth || window.innerWidth * 0.7,
          canvasHeight || window.innerHeight * 0.7
        );
        
        resolve({
          src: imageUrl,
          dataUrl: canvas.toDataURL(),
          thumbnailDataUrl,
          size: appropriateSize,
          originalSize: {
            width,
            height
          }
        });
      } catch (error) {
        console.error('Error processing library image:', error);
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
    img.crossOrigin = "anonymous"; // Enable CORS for Supabase storage URLs
  });
};

export { compressImageToWebP, createThumbnail };
