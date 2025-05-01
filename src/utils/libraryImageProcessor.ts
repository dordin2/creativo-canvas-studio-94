
import { DesignElement } from "@/types/designTypes";
import { compressImageToWebP, createThumbnail } from "@/utils/imageUploader";
import { calculateAppropriateImageSize } from "@/utils/elementUtils";

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
  return new Promise((resolve, reject) => {
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
      
      // Draw to canvas to get initial data URL
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      resolve({
        dataUrl: canvas.toDataURL(),
        size: appropriateSize,
        originalSize: {
          width,
          height
        }
      });
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
    
    // Process image and create thumbnail in parallel
    const [{ dataUrl: processedDataUrl }, thumbnailDataUrl] = await Promise.all([
      compressImageToWebP(canvas.toDataURL()),
      createThumbnail(canvas.toDataURL())
    ]);
    
    // Update the element with processed data
    onUpdate({
      dataUrl: processedDataUrl,
      thumbnailDataUrl,
      // If this is from the library, we know it's already in cloud storage
      storageType: 'cloud',
      cloudStorage: element.cloudStorage || {
        url: imageUrl,
        path: imageUrl.replace(
          `https://dmwwgrbleohkopoqupzo.supabase.co/storage/v1/object/public/`,
          ''
        )
      }
    });
    
  } catch (error) {
    console.error('Background image processing error:', error);
  }
};
