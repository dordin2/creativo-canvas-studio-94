import { DesignElement, FileMetadata } from "@/types/designTypes";

/**
 * Creates a proper deep copy of an element for duplication
 * Handles special cases like image data that can't be easily JSON serialized
 */
export const prepareElementForDuplication = (element: DesignElement): Partial<DesignElement> => {
  console.log("elementUtils - Starting duplication of element:", element.id, element.type);
  
  // Create a base deep copy through serialization/deserialization
  const duplicate = JSON.parse(JSON.stringify(element));
  
  // Handle special element types that require custom copying
  if (element.type === 'image') {
    console.log("elementUtils - Duplicating image element with data:", {
      hasDataUrl: !!element.dataUrl,
      hasThumbnail: !!element.thumbnailDataUrl,
      hasSrc: !!element.src,
      hasCacheKey: !!element.cacheKey,
      originalSize: element.originalSize
    });
    
    // Explicitly preserve the dataUrl - this is crucial for image duplication
    if (element.dataUrl) {
      duplicate.dataUrl = element.dataUrl;
      console.log("elementUtils - Copied dataUrl, length:", element.dataUrl.length);
    }
    
    // Preserve the thumbnail dataUrl if it exists
    if (element.thumbnailDataUrl) {
      duplicate.thumbnailDataUrl = element.thumbnailDataUrl;
      console.log("elementUtils - Copied thumbnailDataUrl");
    }
    
    // Preserve the external source URL if it exists
    if (element.src) {
      duplicate.src = element.src;
      console.log("elementUtils - Copied src URL:", element.src);
    }
    
    // Preserve cache key if it exists
    if (element.cacheKey) {
      duplicate.cacheKey = element.cacheKey;
      console.log("elementUtils - Copied cacheKey:", element.cacheKey);
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
      console.log("elementUtils - Created fileMetadata from File object");
    } else if (element.fileMetadata) {
      // Copy the existing fileMetadata if it exists
      duplicate.fileMetadata = { ...element.fileMetadata };
      console.log("elementUtils - Copied existing fileMetadata");
    }
    
    // Make sure original dimensions are preserved
    if (element.originalSize) {
      duplicate.originalSize = { ...element.originalSize };
      console.log("elementUtils - Copied originalSize:", duplicate.originalSize);
    }
    
    // Make sure current dimensions are preserved
    if (element.size) {
      duplicate.size = { ...element.size };
      console.log("elementUtils - Copied size:", duplicate.size);
    }
    
    // Ensure style properties are properly preserved (including rotation)
    if (element.style) {
      duplicate.style = { ...element.style };
      console.log("elementUtils - Copied style properties");
    }
  }
  
  // Position the duplicate slightly offset from the original
  duplicate.position = {
    x: element.position.x + 20,
    y: element.position.y + 20
  };
  
  // Ensure rotation and other style properties are preserved
  if (element.style) {
    duplicate.style = { ...element.style };
  }
  
  // Remove the id to ensure a new one is generated
  delete duplicate.id;
  
  console.log("elementUtils - Completed element duplication");
  
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
  } else if (element.fileMetadata) {
    clone.fileMetadata = { ...element.fileMetadata };
  }
  
  // Preserve size information
  if (element.originalSize) {
    clone.originalSize = { ...element.originalSize };
  }
  
  if (element.size) {
    clone.size = { ...element.size };
  }
  
  // Preserve style information (including rotation)
  if (element.style) {
    clone.style = { ...element.style };
  }
  
  return clone;
};
