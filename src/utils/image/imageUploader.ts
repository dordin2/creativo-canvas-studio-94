
import { calculateAppropriateImageSize } from "@/utils/element/elementUtils";

// Cache for storing large image data (to minimize memory usage)
const imageCache = new Map<string, string>();

export const getImageFromCache = (key: string): string | undefined => {
  return imageCache.get(key);
};

export const processImageUpload = (
  file: File,
  onUpdate: (updates: any) => void,
  canvasWidth?: number,
  canvasHeight?: number
) => {
  // First create and immediately show a tiny thumbnail for instant feedback
  createThumbnail(file).then(thumbnailDataUrl => {
    // Update with the thumbnail first for immediate visual feedback
    onUpdate({
      thumbnailDataUrl,
      file,
    });
    
    // Then process the full image in the background
    processFullImage(file, canvasWidth, canvasHeight).then(({ dataUrl, size, originalSize, cacheKey }) => {
      // Update with the full processed image and appropriate size
      onUpdate({
        dataUrl,
        size,
        originalSize,
        cacheKey
      });
    }).catch(error => {
      console.error('Error processing full image:', error);
    });
  }).catch(error => {
    console.error('Error creating thumbnail:', error);
  });
};

const processFullImage = async (
  file: File,
  canvasWidth?: number,
  canvasHeight?: number
): Promise<{
  dataUrl: string;
  size: { width: number; height: number };
  originalSize: { width: number; height: number };
  cacheKey: string;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      const dataUrl = event.target.result as string;
      
      // Create an image object to get the dimensions
      const img = new Image();
      
      img.onload = () => {
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;
        
        // Calculate an appropriate size based on canvas dimensions
        const appropriateSize = calculateAppropriateImageSize(
          originalWidth,
          originalHeight,
          canvasWidth,
          canvasHeight
        );
        
        // Generate a cache key for this image
        const cacheKey = `img_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
        
        // Store in cache
        imageCache.set(cacheKey, dataUrl);
        
        // Create a lightweight version for rendering
        compressImageToWebP(dataUrl, 0.8).then(({ dataUrl: compressedDataUrl }) => {
          resolve({
            dataUrl: compressedDataUrl,
            size: appropriateSize,
            originalSize: {
              width: originalWidth,
              height: originalHeight
            },
            cacheKey
          });
        }).catch(error => {
          console.error('Compression error:', error);
          // If compression fails, use original data
          resolve({
            dataUrl,
            size: appropriateSize,
            originalSize: {
              width: originalWidth,
              height: originalHeight
            },
            cacheKey
          });
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = dataUrl;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const createThumbnail = async (source: File | string): Promise<string> => {
  let dataUrl: string;
  
  if (typeof source === 'string') {
    // Source is already a data URL
    dataUrl = source;
  } else {
    // Source is a File, need to read it
    dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(source);
    });
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create a small thumbnail canvas (100px width max)
      const canvas = document.createElement('canvas');
      const MAX_THUMB_WIDTH = 100;
      
      // Calculate thumbnail dimensions maintaining aspect ratio
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      canvas.width = MAX_THUMB_WIDTH;
      canvas.height = MAX_THUMB_WIDTH / aspectRatio;
      
      // Draw the image at the smaller size
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL with high compression (low quality) for small size
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    
    img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
    img.src = dataUrl;
  });
};

export const compressImageToWebP = async (
  dataUrl: string,
  quality = 0.8
): Promise<{ dataUrl: string; size: number }> => {
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
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert to WebP format with specified quality
      const webpDataUrl = canvas.toDataURL('image/webp', quality);
      
      // Calculate approximate size in bytes (rough estimate based on base64 data)
      const base64Length = webpDataUrl.length - webpDataUrl.indexOf(',') - 1;
      const sizeInBytes = (base64Length * 0.75); // Base64 size to bytes conversion
      
      resolve({
        dataUrl: webpDataUrl,
        size: sizeInBytes
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = dataUrl;
  });
};
