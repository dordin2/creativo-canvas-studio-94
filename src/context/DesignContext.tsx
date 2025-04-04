
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
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
import { useLanguage } from "@/context/LanguageContext";

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [activeElement, setActiveElement] = useState<DesignElement | null>(null);
  const [canvasRef, setCanvasRefState] = useState<HTMLDivElement | null>(null);
  const [history, setHistory] = useState<DesignElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const { t } = useLanguage();
  
  // Function to set canvas reference
  const setCanvasRef = (ref: HTMLDivElement) => {
    setCanvasRefState(ref);
  };
  
  // Add a state change to history
  const addToHistory = useCallback((newElements: DesignElement[]) => {
    const newHistoryIndex = historyIndex + 1;
    // Remove any "future" states if we've gone back in history and then made a change
    const newHistory = history.slice(0, newHistoryIndex);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistoryIndex);
  }, [history, historyIndex]);
  
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
        addToHistory(updatedElements);
        setActiveElement(newElement);
        toast.success(`Added new ${type}`);
        return newElement;
      }
      
      // If no existing background was updated, create a new one
      const backgroundElement = createNewElement(type, position, 0, props);
      const newElements = [...elements, backgroundElement];
      setElements(newElements);
      addToHistory(newElements);
      setActiveElement(backgroundElement);
      toast.success(`Added new ${type}`);
      return backgroundElement;
    }
    
    // For all other element types
    const newElement = createNewElement(type, position, newLayer, props);
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
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
    addToHistory(updatedElements);
    
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
    addToHistory(updatedElements);
    
    // Also update active element if it's the one being updated
    if (activeElement && activeElement.id === id) {
      setActiveElement({ ...activeElement, layer: newLayer });
    }
    
    toast.success(`Updated layer to ${newLayer}`);
  };
  
  // Remove an element
  const removeElement = (id: string) => {
    const newElements = elements.filter(element => element.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    
    if (activeElement && activeElement.id === id) {
      setActiveElement(null);
    }
  };
  
  // Undo last action
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      setElements(previousState);
      setHistoryIndex(newIndex);
      
      // Reset active element if it no longer exists
      if (activeElement) {
        const elementStillExists = previousState.some(e => e.id === activeElement.id);
        if (!elementStillExists) {
          setActiveElement(null);
        } else {
          const updatedActiveElement = previousState.find(e => e.id === activeElement.id);
          if (updatedActiveElement) {
            setActiveElement(updatedActiveElement);
          }
        }
      }
      
      toast.success(t('toast.success.undo'));
    } else {
      toast.info(t('toast.info.noMoreUndo'));
    }
  }, [historyIndex, history, activeElement, t]);
  
  // Redo last undone action
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setElements(nextState);
      setHistoryIndex(newIndex);
      
      // Update active element if needed
      if (activeElement) {
        const updatedActiveElement = nextState.find(e => e.id === activeElement.id);
        if (updatedActiveElement) {
          setActiveElement(updatedActiveElement);
        } else {
          setActiveElement(null);
        }
      }
      
      toast.success(t('toast.success.redo'));
    } else {
      toast.info(t('toast.info.noMoreRedo'));
    }
  }, [historyIndex, history, activeElement, t]);
  
  // Initialize history on first render
  if (history.length === 0 && elements.length > 0) {
    addToHistory(elements);
  }
  
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
    handleImageUpload,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
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
