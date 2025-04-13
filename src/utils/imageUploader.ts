
import { toast } from "sonner";
import { DesignElement } from "@/types/designTypes";

// Create a local cache to store image data with memory limits
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB cache limit
const IMAGE_QUALITY = 0.85; // Default quality setting for WebP compression
const MAX_DIMENSION = 300; // Default preview max dimension
const THUMBNAIL_DIMENSION = 100; // Thumbnail size for lightweight previews

// Cache implementation with size tracking
class ImageCache {
  private cache: Map<string, string> = new Map();
  private thumbnailCache: Map<string, string> = new Map();
  private cacheSize: number = 0;
  
  set(key: string, dataUrl: string, isThumbnail: boolean = false): void {
    const targetCache = isThumbnail ? this.thumbnailCache : this.cache;
    const dataSize = this.getDataUrlSize(dataUrl);
    
    // Check if we need to evict items from cache
    if (this.cacheSize + dataSize > MAX_CACHE_SIZE) {
      this.evictOldestEntries(dataSize);
    }
    
    targetCache.set(key, dataUrl);
    this.cacheSize += dataSize;
    
    console.log(`ImageCache - Added image to ${isThumbnail ? 'thumbnail' : 'main'} cache:`, {
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
        console.log("ImageCache - Evicted thumbnails to free space:", 
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
      
      console.log("ImageCache - Evicted image from cache:", key);
      
      if (freedSpace >= requiredSpace) {
        console.log("ImageCache - Total freed space:", 
                   (freedSpace / 1024).toFixed(2) + 'KB');
        return;
      }
    }
  }
}

// Initialize the cache
const imageCache = new ImageCache();

/**
 * Compresses an image to WebP format with the specified quality
 */
async function compressImageToWebP(
  imageDataUrl: string, 
  quality: number = IMAGE_QUALITY
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert to WebP with specified quality
      try {
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpDataUrl);
      } catch (err) {
        console.error('WebP conversion failed, falling back to JPEG:', err);
        try {
          // Fallback to JPEG if WebP is not supported
          const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(jpegDataUrl);
        } catch (jpegErr) {
          reject(new Error('Image compression failed'));
        }
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
        const thumbnailDataUrl = canvas.toDataURL('image/webp', 0.7);
        resolve(thumbnailDataUrl);
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

export const processImageUpload = (
  file: File, 
  onSuccess: (data: Partial<DesignElement>) => void
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
        
        // Compress image to WebP
        const compressedDataUrl = await compressImageToWebP(originalDataUrl);
        
        // Create thumbnail for lightweight previews
        const thumbnailDataUrl = await createThumbnail(compressedDataUrl);
        
        // Cache both versions
        const cacheKey = `img_${file.name}_${file.size}_${file.lastModified}`;
        imageCache.set(cacheKey, compressedDataUrl);
        imageCache.set(`${cacheKey}_thumbnail`, thumbnailDataUrl, true);
        
        // Log compression results
        const originalSize = Math.round(originalDataUrl.length / 1024);
        const compressedSize = Math.round(compressedDataUrl.length / 1024);
        const compressionRatio = Math.round((compressedSize / originalSize) * 100);
        
        console.log("imageUploader - Compression results:", {
          originalSize: `${originalSize}KB`,
          compressedSize: `${compressedSize}KB`,
          compressionRatio: `${compressionRatio}%`,
          spaceReduction: `${originalSize - compressedSize}KB (${100 - compressionRatio}%)`
        });
        
        // Create a new image element to get dimensions
        const img = new Image();
        img.onload = () => {
          // Get the natural dimensions
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;
          
          // Calculate scaled dimensions
          let scaledWidth = naturalWidth;
          let scaledHeight = naturalHeight;
          
          // Scale down only if larger than target size
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
          
          // Clear loading toast
          toast.dismiss(loadingToast);
          
          // Provide the processed image data
          onSuccess({ 
            dataUrl: compressedDataUrl, 
            thumbnailDataUrl, // Store thumbnail for lightweight previews
            src: undefined, // Clear external URL when using local file
            file: file, // Store original file reference
            cacheKey, // Store cache key for retrieval
            size: {
              width: scaledWidth,
              height: scaledHeight
            },
            originalSize: {  
              width: naturalWidth,
              height: naturalHeight
            }
          });
          
          toast.success("Image optimized and uploaded");
        };
        
        img.onerror = () => {
          toast.dismiss(loadingToast);
          toast.error("Failed to load image dimensions");
        };
        
        // Set the source to the WebP data URL
        img.src = compressedDataUrl;
        
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
 * Retrieves an image from the cache by its cache key
 * @param cacheKey The key to lookup in the cache
 * @param thumbnail Whether to retrieve the thumbnail version
 */
export const getImageFromCache = (cacheKey: string, thumbnail: boolean = false): string | undefined => {
  return imageCache.get(cacheKey, thumbnail);
};

/**
 * Stores an image in the cache
 */
export const storeImageInCache = (cacheKey: string, dataUrl: string, isThumbnail: boolean = false): void => {
  imageCache.set(cacheKey, dataUrl, isThumbnail);
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
