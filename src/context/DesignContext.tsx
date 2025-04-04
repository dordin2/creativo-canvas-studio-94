
import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { 
  ElementType, 
  DesignElement, 
  DesignContextType 
} from "@/types/designTypes";
import { 
  getDefaultPosition, 
  createNewElement 
} from "@/utils/elementFactory";
import { processImageUpload } from "@/utils/imageUploader";
import { getHighestLayer, handleBackgroundLayer } from "@/utils/layerUtils";

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [activeElement, setActiveElement] = useState<DesignElement | null>(null);
  const [canvasRef, setCanvasRefState] = useState<HTMLDivElement | null>(null);
  
  // Function to set canvas reference
  const setCanvasRef = (ref: HTMLDivElement) => {
    setCanvasRefState(ref);
  };
  
  // Handle image file uploads
  const handleImageUpload = (id: string, file: File) => {
    processImageUpload(file, (updatedData) => {
      updateElement(id, updatedData);
    });
  };
  
  // Add a new element to the canvas
  const addElement = (type: ElementType, props?: any): DesignElement => {
    const position = getDefaultPosition(canvasRef);
    const newLayer = getHighestLayer(elements);
    
    // Special handling for background element
    if (type === 'background') {
      const { elements: updatedElements, newElement } = handleBackgroundLayer(elements, props);
      
      if (newElement) {
        setElements(updatedElements);
        setActiveElement(newElement);
        toast.success(`Added new ${type}`);
        return newElement;
      }
      
      // If no existing background was updated, create a new one
      const backgroundElement = createNewElement(type, position, 0, props);
      setElements([...elements, backgroundElement]);
      setActiveElement(backgroundElement);
      toast.success(`Added new ${type}`);
      return backgroundElement;
    }
    
    // For all other element types
    const newElement = createNewElement(type, position, newLayer, props);
    setElements([...elements, newElement]);
    setActiveElement(newElement);
    
    toast.success(`Added new ${type}`);
    return newElement;
  };
  
  // Update an existing element
  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    const updatedElements = elements.map(element => {
      if (element.id === id) {
        return { ...element, ...updates };
      }
      return element;
    });
    
    setElements(updatedElements);
    
    // Also update active element if it's the one being updated
    if (activeElement && activeElement.id === id) {
      setActiveElement({ ...activeElement, ...updates });
    }
  };
  
  // Update element layer specifically
  const updateElementLayer = (id: string, newLayer: number) => {
    const updatedElements = elements.map(element => {
      if (element.id === id) {
        return { ...element, layer: newLayer };
      }
      return element;
    });
    
    setElements(updatedElements);
    
    // Also update active element if it's the one being updated
    if (activeElement && activeElement.id === id) {
      setActiveElement({ ...activeElement, layer: newLayer });
    }
    
    toast.success(`Updated layer to ${newLayer}`);
  };
  
  // Remove an element
  const removeElement = (id: string) => {
    setElements(elements.filter(element => element.id !== id));
    
    if (activeElement && activeElement.id === id) {
      setActiveElement(null);
    }
  };
  
  const value = {
    elements,
    activeElement,
    canvasRef,
    setCanvasRef,
    addElement,
    updateElement,
    removeElement,
    setActiveElement,
    updateElementLayer,
    getHighestLayer: () => getHighestLayer(elements),
    handleImageUpload
  };
  
  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesignState = () => {
  const context = useContext(DesignContext);
  
  if (context === undefined) {
    throw new Error('useDesignState must be used within a DesignProvider');
  }
  
  return context;
};

export type { ElementType, DesignElement };
