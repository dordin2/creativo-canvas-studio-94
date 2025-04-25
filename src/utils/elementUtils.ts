
import { DesignElement, FileMetadata } from "@/types/designTypes";

/**
 * Creates a proper deep copy of an element for duplication
 * Handles special cases like image data that can't be easily JSON serialized
 */
export const prepareElementForDuplication = (element: DesignElement): Partial<DesignElement> => {
  let duplicate;
  
  // For image elements, use the specialized cloneImageElement function
  if (element.type === 'image') {
    console.log("ElementUtils - Using cloneImageElement for image duplication");
    duplicate = cloneImageElement(element);
    
    console.log("ElementUtils - Cloned image data:", {
      hasDataUrl: !!duplicate.dataUrl,
      hasThumbnail: !!duplicate.thumbnailDataUrl,
      hasSrc: !!duplicate.src,
      hasCacheKey: !!duplicate.cacheKey,
      hasFileMetadata: !!duplicate.fileMetadata,
      hasOriginalSize: !!duplicate.originalSize,
      hasFile: !!duplicate.file
    });
  } else {
    // For non-image elements, use regular JSON serialization
    duplicate = JSON.parse(JSON.stringify(element));
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
  
  // Create a base clone without the sensitive data
  const baseElement = { ...element };
  delete baseElement.dataUrl;
  delete baseElement.thumbnailDataUrl;
  delete baseElement.file;
  
  // Create the clone through serialization for the base properties
  const clone = JSON.parse(JSON.stringify(baseElement));
  
  // Directly copy image-specific properties to ensure they're preserved
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
