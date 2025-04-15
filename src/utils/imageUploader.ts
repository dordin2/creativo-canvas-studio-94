
import { toast } from "sonner";
import { DesignElement } from "@/types/designTypes";
import imageCompression from "browser-image-compression";

// Create a local cache to store image data with size limits
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB cache limit
const imageCache = new Map<string, string>();
let currentCacheSize = 0;

// Options for image compression
const compressionOptions = {
  maxSizeMB: 1,           // Max image size in MB
  maxWidthOrHeight: 1920, // Max width/height of the output image
  useWebWorker: true,     // Use web workers for better performance
  fileType: 'image/webp', // Convert to WebP format
  initialQuality: 0.8,    // Initial compression quality
};

// Compresses and converts an image to WebP format
const compressToWebP = async (file: File): Promise<File> => {
  try {
    console.log("imageUploader - Starting image compression", {
      originalSize: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type
    });
    
    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);
    
    console.log("imageUploader - Compression complete", {
      originalSize: `${(file.size / 1024).toFixed(2)} KB`,
      compressedSize: `${(compressedFile.size / 1024).toFixed(2)} KB`,
      reduction: `${(100 - (compressedFile.size / file.size) * 100).toFixed(2)}%`,
      newType: compressedFile.type
    });
    
    return compressedFile;
  } catch (error) {
    console.error("imageUploader - Compression failed:", error);
    toast.error("Image compression failed, using original image");
    return file; // Return original file as fallback
  }
};

// Checks if cache has exceeded its limit and removes oldest entries if needed
const manageCacheSize = (newDataSize: number): void => {
  // If adding the new data would exceed the cache size limit
  if (currentCacheSize + newDataSize > MAX_CACHE_SIZE) {
    // Sort entries by access time to remove the oldest
    const entries = Array.from(imageCache.entries());
    // Remove entries until we have enough space
    while (currentCacheSize + newDataSize > MAX_CACHE_SIZE && entries.length > 0) {
      const [oldestKey, oldestValue] = entries.shift()!;
      imageCache.delete(oldestKey);
      currentCacheSize -= oldestValue.length;
      console.log(`imageUploader - Removed item from cache, freed ${(oldestValue.length / 1024).toFixed(2)} KB`);
    }
  }
};

export const processImageUpload = async (
  file: File, 
  onSuccess: (data: Partial<DesignElement>) => void
): Promise<void> => {
  if (!file.type.startsWith('image/')) {
    toast.error("Please upload a valid image file");
    return;
  }
  
  try {
    // Show loading toast 
    const loadingToast = toast.loading("Processing image...");
    
    // Compress and convert the image to WebP
    const optimizedFile = await compressToWebP(file);
    
    // Create a FileReader to generate dataURL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result as string;
        
        // Manage cache size before adding new entry
        manageCacheSize(dataUrl.length);
        
        // Cache the image data with a unique identifier
        const cacheKey = `img_${optimizedFile.name}_${optimizedFile.size}_${Date.now()}`;
        imageCache.set(cacheKey, dataUrl);
        currentCacheSize += dataUrl.length;
        
        console.log("imageUploader - Cache status:", {
          cacheItems: imageCache.size,
          cacheSize: `${(currentCacheSize / 1024 / 1024).toFixed(2)} MB`,
          maxSize: `${(MAX_CACHE_SIZE / 1024 / 1024).toFixed(2)} MB`
        });
        
        // Create a new image element to get dimensions
        const img = new Image();
        img.onload = () => {
          // Close loading toast
          toast.dismiss(loadingToast);
          
          // Get the natural dimensions
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;
          
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
          
          // Provide the processed image data
          onSuccess({ 
            dataUrl, 
            src: undefined,
            file: optimizedFile,
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
          
          toast.success(`Image optimized and converted to WebP (${Math.round(optimizedFile.size / 1024)} KB)`);
        };
        
        img.onerror = () => {
          toast.dismiss(loadingToast);
          toast.error("Failed to load image dimensions");
        };
        
        img.src = dataUrl;
      }
    };
    
    reader.onerror = () => {
      toast.dismiss(loadingToast);
      toast.error("Failed to load image");
    };
    
    reader.readAsDataURL(optimizedFile);
  } catch (error) {
    console.error("Error processing image:", error);
    toast.error("Failed to process image");
  }
};

/**
 * Retrieves an image from the cache by its cache key with lazy loading
 */
export const getImageFromCache = (cacheKey: string): string | undefined => {
  return imageCache.get(cacheKey);
};

/**
 * Stores an image in the cache with size management
 */
export const storeImageInCache = (cacheKey: string, dataUrl: string): void => {
  // Manage cache size before adding
  manageCacheSize(dataUrl.length);
  
  // Add to cache
  imageCache.set(cacheKey, dataUrl);
  currentCacheSize += dataUrl.length;
};
