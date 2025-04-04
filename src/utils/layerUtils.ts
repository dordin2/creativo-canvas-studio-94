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
