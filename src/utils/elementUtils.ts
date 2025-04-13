
import { DesignElement, FileMetadata } from "@/types/designTypes";

/**
 * Creates a proper deep copy of an element for duplication
 * Handles special cases like image data that can't be easily JSON serialized
 */
export const prepareElementForDuplication = (element: DesignElement): Partial<DesignElement> => {
  // Create a base deep copy through serialization/deserialization
  const duplicate = JSON.parse(JSON.stringify(element));
  
  // Handle special element types that require custom copying
  if (element.type === 'image') {
    // Explicitly preserve the dataUrl - this is crucial for image duplication
    if (element.dataUrl) {
      duplicate.dataUrl = element.dataUrl;
    }
    
    // Preserve the thumbnail dataUrl if it exists
    if (element.thumbnailDataUrl) {
      duplicate.thumbnailDataUrl = element.thumbnailDataUrl;
    }
    
    // Preserve the external source URL if it exists
    if (element.src) {
      duplicate.src = element.src;
    }
    
    // Preserve cache key if it exists
    if (element.cacheKey) {
      duplicate.cacheKey = element.cacheKey;
    }
    
    // File objects can't be cloned via JSON, but we need to keep track that a file existed
    // We'll store a reference to indicate that this was originally a file upload
    if (element.file) {
      // We can't clone the file object, but we can keep its metadata
      duplicate.fileMetadata = {
        name: element.file.name,
        type: element.file.type,
        size: element.file.size,
        lastModified: element.file.lastModified
      };
    }
    
    // Make sure original dimensions are preserved
    if (element.originalSize) {
      duplicate.originalSize = { ...element.originalSize };
    }
    
    console.log("elementUtils - Image element duplicated with data:", {
      dataUrl: duplicate.dataUrl ? "exists" : "missing",
      dataUrlLength: duplicate.dataUrl ? duplicate.dataUrl.length : 0,
      thumbnailExists: !!duplicate.thumbnailDataUrl,
      src: duplicate.src,
      cacheKey: duplicate.cacheKey,
      fileMetadata: duplicate.fileMetadata,
      originalSize: duplicate.originalSize
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
