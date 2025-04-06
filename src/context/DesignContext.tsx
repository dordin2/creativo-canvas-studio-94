
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { 
  ElementType, 
  DesignElement, 
  DesignContextType,
  Canvas,
  generateId,
  InteractionType
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
  const [canvases, setCanvases] = useState<Canvas[]>([
    { id: generateId(), name: "Canvas 1", elements: [] }
  ]);
  const [activeCanvasIndex, setActiveCanvasIndex] = useState<number>(0);
  const [activeElement, setActiveElement] = useState<DesignElement | null>(null);
  const [canvasRef, setCanvasRefState] = useState<HTMLDivElement | null>(null);
  const [history, setHistory] = useState<Canvas[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const { t } = useLanguage();
  
  const setCanvasRef = (ref: HTMLDivElement) => {
    setCanvasRefState(ref);
  };
  
  const addToHistory = useCallback((newCanvases: Canvas[]) => {
    const newHistoryIndex = historyIndex + 1;
    const newHistory = history.slice(0, newHistoryIndex);
    newHistory.push(JSON.parse(JSON.stringify(newCanvases)));
    setHistory(newHistory);
    setHistoryIndex(newHistoryIndex);
  }, [history, historyIndex]);
  
  const elements = canvases[activeCanvasIndex]?.elements || [];
  
  const updateElementWithoutHistory = useCallback((id: string, updates: Partial<DesignElement>) => {
    const updatedCanvases = [...canvases];
    const activeCanvas = updatedCanvases[activeCanvasIndex];
    
    if (!activeCanvas) return;
    
    activeCanvas.elements = activeCanvas.elements.map(element => {
      if (element.id === id) {
        return { ...element, ...updates };
      }
      return element;
    });
    
    setCanvases(updatedCanvases);
    
    if (activeElement && activeElement.id === id) {
      setActiveElement({ ...activeElement, ...updates });
    }
  }, [canvases, activeCanvasIndex, activeElement]);
  
  const commitToHistory = useCallback(() => {
    addToHistory(canvases);
  }, [canvases, addToHistory]);
  
  const handleImageUpload = (id: string, file: File) => {
    processImageUpload(file, (updatedData) => {
      updateElement(id, updatedData);
    });
  };
  
  const addElement = (type: ElementType, props?: any): DesignElement => {
    const position = getDefaultPosition(canvasRef);
    const newLayer = getHighestLayer(elements);
    
    if (type === 'background') {
      const { elements: updatedElements, newElement } = handleBackgroundLayer(elements, props);
      
      if (newElement) {
        const updatedCanvases = [...canvases];
        updatedCanvases[activeCanvasIndex].elements = updatedElements;
        
        setCanvases(updatedCanvases);
        addToHistory(updatedCanvases);
        setActiveElement(newElement);
        toast.success(`Added new ${type}`);
        return newElement;
      }
      
      const backgroundElement = createNewElement(type, position, 0, props);
      const updatedCanvases = [...canvases];
      updatedCanvases[activeCanvasIndex].elements = [...elements, backgroundElement];
      
      setCanvases(updatedCanvases);
      addToHistory(updatedCanvases);
      setActiveElement(backgroundElement);
      toast.success(`Added new ${type}`);
      return backgroundElement;
    }
    
    const newElement = createNewElement(type, position, newLayer, props);
    const updatedCanvases = [...canvases];
    updatedCanvases[activeCanvasIndex].elements = [...elements, newElement];
    
    setCanvases(updatedCanvases);
    addToHistory(updatedCanvases);
    setActiveElement(newElement);
    
    toast.success(`Added new ${type}`);
    return newElement;
  };
  
  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    const updatedCanvases = [...canvases];
    const activeCanvas = updatedCanvases[activeCanvasIndex];
    
    if (!activeCanvas) return;
    
    activeCanvas.elements = activeCanvas.elements.map(element => {
      if (element.id === id) {
        return { ...element, ...updates };
      }
      return element;
    });
    
    setCanvases(updatedCanvases);
    addToHistory(updatedCanvases);
    
    if (activeElement && activeElement.id === id) {
      setActiveElement({ ...activeElement, ...updates });
    }
  };
  
  const updateElementLayer = (id: string, newLayer: number) => {
    const updatedCanvases = [...canvases];
    const activeCanvas = updatedCanvases[activeCanvasIndex];
    
    if (!activeCanvas) return;
    
    activeCanvas.elements = activeCanvas.elements.map(element => {
      if (element.id === id) {
        return { ...element, layer: newLayer };
      }
      return element;
    });
    
    setCanvases(updatedCanvases);
    addToHistory(updatedCanvases);
    
    if (activeElement && activeElement.id === id) {
      setActiveElement({ ...activeElement, layer: newLayer });
    }
    
    toast.success(`Updated layer to ${newLayer}`);
  };
  
  const removeElement = (id: string) => {
    const updatedCanvases = [...canvases];
    const activeCanvas = updatedCanvases[activeCanvasIndex];
    
    if (!activeCanvas) return;
    
    activeCanvas.elements = activeCanvas.elements.filter(element => element.id !== id);
    
    setCanvases(updatedCanvases);
    addToHistory(updatedCanvases);
    
    if (activeElement && activeElement.id === id) {
      setActiveElement(null);
    }
  };
  
  const addCanvas = () => {
    const newCanvas: Canvas = {
      id: generateId(),
      name: `Canvas ${canvases.length + 1}`,
      elements: []
    };
    
    const updatedCanvases = [...canvases, newCanvas];
    setCanvases(updatedCanvases);
    setActiveCanvasIndex(updatedCanvases.length - 1);
    addToHistory(updatedCanvases);
    setActiveElement(null);
    
    toast.success(t('toast.success.addCanvas') || "Added new canvas");
  };
  
  const removeCanvas = (index: number) => {
    if (canvases.length <= 1) {
      toast.error(t('toast.error.cannotRemoveLastCanvas') || "Cannot remove the last canvas");
      return;
    }
    
    const updatedCanvases = [...canvases];
    updatedCanvases.splice(index, 1);
    
    setCanvases(updatedCanvases);
    
    if (activeCanvasIndex >= index) {
      const newActiveIndex = Math.max(0, activeCanvasIndex - 1);
      setActiveCanvasIndex(newActiveIndex);
    }
    
    addToHistory(updatedCanvases);
    setActiveElement(null);
    
    toast.success(t('toast.success.removeCanvas') || "Canvas removed");
  };
  
  const setActiveCanvas = (index: number) => {
    if (index >= 0 && index < canvases.length) {
      setActiveCanvasIndex(index);
      setActiveElement(null);
    }
  };
  
  const updateCanvasName = (id: string, newName: string) => {
    const updatedCanvases = [...canvases];
    const canvasIndex = updatedCanvases.findIndex(canvas => canvas.id === id);
    
    if (canvasIndex !== -1) {
      updatedCanvases[canvasIndex].name = newName || updatedCanvases[canvasIndex].name;
      setCanvases(updatedCanvases);
      addToHistory(updatedCanvases);
      toast.success(t('toast.success.updateCanvasName') || "Canvas name updated");
    }
  };
  
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      setCanvases(previousState);
      setHistoryIndex(newIndex);
      
      if (activeElement) {
        const activeCanvas = previousState[activeCanvasIndex];
        if (activeCanvas) {
          const elementStillExists = activeCanvas.elements.some(e => e.id === activeElement.id);
          if (!elementStillExists) {
            setActiveElement(null);
          } else {
            const updatedActiveElement = activeCanvas.elements.find(e => e.id === activeElement.id);
            if (updatedActiveElement) {
              setActiveElement(updatedActiveElement);
            }
          }
        } else {
          setActiveElement(null);
        }
      }
      
      toast.success(t('toast.success.undo'));
    } else {
      toast.info(t('toast.info.noMoreUndo'));
    }
  }, [historyIndex, history, activeElement, activeCanvasIndex, t]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setCanvases(nextState);
      setHistoryIndex(newIndex);
      
      if (activeElement) {
        const activeCanvas = nextState[activeCanvasIndex];
        if (activeCanvas) {
          const updatedActiveElement = activeCanvas.elements.find(e => e.id === activeElement.id);
          if (updatedActiveElement) {
            setActiveElement(updatedActiveElement);
          } else {
            setActiveElement(null);
          }
        } else {
          setActiveElement(null);
        }
      }
      
      toast.success(t('toast.success.redo'));
    } else {
      toast.info(t('toast.info.noMoreRedo'));
    }
  }, [historyIndex, history, activeElement, activeCanvasIndex, t]);
  
  if (history.length === 0 && canvases.length > 0) {
    addToHistory(canvases);
  }
  
  const value = {
    canvases,
    activeCanvasIndex,
    elements,
    activeElement,
    canvasRef,
    setCanvasRef,
    addElement,
    updateElement,
    updateElementWithoutHistory,
    commitToHistory,
    removeElement,
    setActiveElement,
    updateElementLayer,
    getHighestLayer: () => getHighestLayer(elements),
    handleImageUpload,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    addCanvas,
    removeCanvas,
    setActiveCanvas,
    updateCanvasName
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

export type { ElementType, DesignElement, InteractionType };
