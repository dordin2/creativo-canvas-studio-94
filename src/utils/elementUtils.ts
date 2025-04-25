
import { DesignElement, FileMetadata } from "@/types/designTypes";

/**
 * Creates a proper deep copy of an element for duplication
 * Handles special cases like image data that can't be easily JSON serialized
 */
export const prepareElementForDuplication = (element: DesignElement): Partial<DesignElement> => {
  // First handle image-specific data that needs special handling
  let imageData = {};
  
  if (element.type === 'image') {
    console.log("ElementUtils - Preparing image data for duplication");
    
    // Preserve image-specific data before JSON serialization
    imageData = {
      dataUrl: element.dataUrl,
      thumbnailDataUrl: element.thumbnailDataUrl,
      src: element.src,
      cacheKey: element.cacheKey
    };
    
    if (element.file) {
      imageData = {
        ...imageData,
        fileMetadata: {
          name: element.file.name,
          type: element.file.type,
          size: element.file.size,
          lastModified: element.file.lastModified
        }
      };
    }
    
    if (element.originalSize) {
      imageData = {
        ...imageData,
        originalSize: { ...element.originalSize }
      };
    }
    
    console.log("ElementUtils - Image data prepared:", {
      hasDataUrl: !!element.dataUrl,
      hasThumbnail: !!element.thumbnailDataUrl,
      hasSrc: !!element.src,
      hasCacheKey: !!element.cacheKey,
      hasFileMetadata: !!element.file,
      hasOriginalSize: !!element.originalSize
    });
  }
  
  // Create base duplicate through serialization (excluding image data)
  const elementForSerialization = { ...element };
  if (element.type === 'image') {
    delete elementForSerialization.dataUrl;
    delete elementForSerialization.thumbnailDataUrl;
    delete elementForSerialization.file;
  }
  
  // Create the duplicate through serialization
  const duplicate = JSON.parse(JSON.stringify(elementForSerialization));
  
  // Restore image data if this was an image element
  if (element.type === 'image') {
    Object.assign(duplicate, imageData);
    
    console.log("ElementUtils - Final duplicate image data:", {
      hasDataUrl: !!duplicate.dataUrl,
      hasThumbnail: !!duplicate.thumbnailDataUrl,
      hasSrc: !!duplicate.src,
      hasCacheKey: !!duplicate.cacheKey,
      hasFileMetadata: !!duplicate.fileMetadata,
      hasOriginalSize: !!duplicate.originalSize
    });
  }
  
  // Position the duplicate slightly offset from the original
  duplicate.position = {
    x: element.position.x + 20,
    y: element.position.y + 20
  };
  
  // Remove the id to ensure a new one is generated
  delete duplicate.id;
  
  return duplicate;
};

/**
 * Creates a deep clone of an image element and ensures all image data is preserved
 * This function is specifically designed for image elements to ensure their data
 * is properly cloned when moving between canvases or duplicating
 */
export const cloneImageElement = (element: DesignElement): Partial<DesignElement> => {
  if (element.type !== 'image') {
    return JSON.parse(JSON.stringify(element));
  }
  
  // Create a basic clone
  const clone = JSON.parse(JSON.stringify(element));
  
  // Ensure image-specific properties are properly preserved
  if (element.dataUrl) {
    clone.dataUrl = element.dataUrl;
  }
  
  if (element.thumbnailDataUrl) {
    clone.thumbnailDataUrl = element.thumbnailDataUrl;
  }
  
  if (element.src) {
    clone.src = element.src;
  }
  
  if (element.cacheKey) {
    clone.cacheKey = element.cacheKey;
  }
  
  // For original file information, store metadata
  if (element.file) {
    clone.fileMetadata = {
      name: element.file.name,
      type: element.file.type,
      size: element.file.size,
      lastModified: element.file.lastModified
    };
  }
  
  // Preserve size information
  if (element.originalSize) {
    clone.originalSize = { ...element.originalSize };
  }
  
  if (element.size) {
    clone.size = { ...element.size };
  }
  
  return clone;
};

