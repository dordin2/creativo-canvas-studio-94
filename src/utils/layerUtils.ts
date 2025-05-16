
import { DesignElement } from "@/types/designTypes";

// Get highest layer to place new elements on top
export const getHighestLayer = (elements: DesignElement[]): number => {
  if (elements.length === 0) return 1;
  return Math.max(...elements.map(elem => elem.layer)) + 1;
};

// Find or create background layer
export const handleBackgroundLayer = (
  elements: DesignElement[], 
  props?: any
): { elements: DesignElement[], newElement?: DesignElement } => {
  // Check if background already exists
  const bgExists = elements.some(el => el.type === 'background');
  
  if (bgExists) {
    // Update existing background
    const updatedElements = elements.map(el => {
      if (el.type === 'background') {
        return {
          ...el,
          style: props?.gradient 
            ? { background: props.gradient } 
            : { backgroundColor: props?.color || '#FFFFFF' }
        };
      }
      return el;
    });
    
    return { 
      elements: updatedElements,
      newElement: updatedElements.find(el => el.type === 'background')
    };
  }
  
  // Return unchanged elements if no background operation was performed
  return { elements };
};

// Update element layers based on drag and drop reordering
export const updateElementsOrder = (
  allElements: DesignElement[],
  sourceIndex: number, 
  targetIndex: number,
  layerElements: DesignElement[]
): DesignElement[] => {
  // Split into non-layer elements (like background) and layered elements
  const nonLayerElements = allElements.filter(el => el.type === 'background');
  
  // Create a copy of layer elements
  const updatedLayerElements = [...layerElements];
  
  // Ensure indices are valid
  if (sourceIndex < 0 || sourceIndex >= updatedLayerElements.length || 
      targetIndex < 0 || targetIndex >= updatedLayerElements.length) {
    console.error("Invalid source or target index for layer reordering", {
      sourceIndex,
      targetIndex,
      layerCount: updatedLayerElements.length
    });
    return allElements;
  }
  
  // Remove the element from source position
  const [draggedItem] = updatedLayerElements.splice(sourceIndex, 1);
  
  // Insert it at the target position
  updatedLayerElements.splice(targetIndex, 0, draggedItem);
  
  // Reassign layer values based on new positions (reverse order since higher index means higher layer)
  const reorderedElements = updatedLayerElements.map((element, index) => {
    // We reverse the index for layer value since we want the top item to have highest layer
    const newLayer = updatedLayerElements.length - index;
    return {
      ...element,
      layer: newLayer
    };
  });
  
  // Combine non-layer elements with newly ordered layer elements
  return [...nonLayerElements, ...reorderedElements];
};

