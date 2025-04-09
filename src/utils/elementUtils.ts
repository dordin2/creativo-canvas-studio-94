
import { DesignElement } from "@/types/designTypes";

/**
 * Creates a proper deep copy of an element for duplication
 * Handles special cases like image data that can't be easily JSON serialized
 */
export const prepareElementForDuplication = (element: DesignElement): Partial<DesignElement> => {
  // Create a base deep copy through serialization/deserialization
  const duplicate = JSON.parse(JSON.stringify(element));
  
  // Handle special element types that require custom copying
  if (element.type === 'image') {
    // Ensure image data is properly preserved
    duplicate.dataUrl = element.dataUrl;
    duplicate.src = element.src;
    
    // File objects can't be cloned via JSON, so reference the original
    if (element.file) {
      duplicate.file = element.file;
    }
    
    // Make sure original dimensions are preserved
    if (element.originalSize) {
      duplicate.originalSize = { ...element.originalSize };
    }
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
