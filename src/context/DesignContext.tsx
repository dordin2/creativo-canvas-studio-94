
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
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [canvasRef, setCanvasRefState] = useState<HTMLDivElement | null>(null);
  const [history, setHistory] = useState<Canvas[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isGameMode, setIsGameMode] = useState<boolean>(false);
  const { t } = useLanguage();
  
  const setCanvasRef = (ref: HTMLDivElement) => {
    setCanvasRefState(ref);
  };
  
  const toggleGameMode = () => {
    setIsGameMode(prev => !prev);
    if (!isGameMode) {
      setActiveElement(null);
      setSelectedElementIds([]);
    }
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

  const updateMultipleElementsWithoutHistory = useCallback((elementIds: string[], updateFn: (element: DesignElement) => Partial<DesignElement>) => {
    const updatedCanvases = [...canvases];
    const activeCanvas = updatedCanvases[activeCanvasIndex];
    
    if (!activeCanvas) return;
    
    activeCanvas.elements = activeCanvas.elements.map(element => {
      if (elementIds.includes(element.id)) {
        return { ...element, ...updateFn(element) };
      }
      return element;
    });
    
    setCanvases(updatedCanvases);
    
    if (activeElement && elementIds.includes(activeElement.id)) {
      setActiveElement({ ...activeElement, ...updateFn(activeElement) });
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
        setSelectedElementIds([newElement.id]);
        toast.success(`Added new ${type}`);
        return newElement;
      }
      
      const backgroundElement = createNewElement(type, position, 0, props);
      const updatedCanvases = [...canvases];
      updatedCanvases[activeCanvasIndex].elements = [...elements, backgroundElement];
      
      setCanvases(updatedCanvases);
      addToHistory(updatedCanvases);
      setActiveElement(backgroundElement);
      setSelectedElementIds([backgroundElement.id]);
      toast.success(`Added new ${type}`);
      return backgroundElement;
    }
    
    const newElement = createNewElement(type, position, newLayer, props);
    const updatedCanvases = [...canvases];
    updatedCanvases[activeCanvasIndex].elements = [...elements, newElement];
    
    setCanvases(updatedCanvases);
    addToHistory(updatedCanvases);
    setActiveElement(newElement);
    setSelectedElementIds([newElement.id]);
    
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

  const updateMultipleElements = (elementIds: string[], updateFn: (element: DesignElement) => Partial<DesignElement>) => {
    const updatedCanvases = [...canvases];
    const activeCanvas = updatedCanvases[activeCanvasIndex];
    
    if (!activeCanvas) return;
    
    activeCanvas.elements = activeCanvas.elements.map(element => {
      if (elementIds.includes(element.id)) {
        return { ...element, ...updateFn(element) };
      }
      return element;
    });
    
    setCanvases(updatedCanvases);
    addToHistory(updatedCanvases);
    
    if (activeElement && elementIds.includes(activeElement.id)) {
      setActiveElement({ ...activeElement, ...updateFn(activeElement) });
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

    // Remove from selected elements
    setSelectedElementIds(prev => prev.filter(elementId => elementId !== id));
  };

  const removeMultipleElements = (ids: string[]) => {
    const updatedCanvases = [...canvases];
    const activeCanvas = updatedCanvases[activeCanvasIndex];
    
    if (!activeCanvas) return;
    
    activeCanvas.elements = activeCanvas.elements.filter(element => !ids.includes(element.id));
    
    setCanvases(updatedCanvases);
    addToHistory(updatedCanvases);
    
    if (activeElement && ids.includes(activeElement.id)) {
      setActiveElement(null);
    }
    
    // Clear selection
    setSelectedElementIds([]);
    
    toast.success(`Removed ${ids.length} elements`);
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
    setSelectedElementIds([]);
    
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
    setSelectedElementIds([]);
    
    toast.success(t('toast.success.removeCanvas') || "Canvas removed");
  };
  
  const setActiveCanvas = (index: number) => {
    if (index >= 0 && index < canvases.length) {
      setActiveCanvasIndex(index);
      setActiveElement(null);
      setSelectedElementIds([]);
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
  
  const duplicateCanvas = (index: number) => {
    const sourceCanvas = canvases[index];
    if (!sourceCanvas) return;
    
    const duplicatedCanvas: Canvas = {
      id: generateId(),
      name: `${sourceCanvas.name} (Copy)`,
      elements: JSON.parse(JSON.stringify(sourceCanvas.elements))
    };
    
    const updatedCanvases = [...canvases];
    updatedCanvases.splice(index + 1, 0, duplicatedCanvas);
    
    setCanvases(updatedCanvases);
    setActiveCanvasIndex(index + 1);
    addToHistory(updatedCanvases);
    setActiveElement(null);
    setSelectedElementIds([]);
    
    toast.success(t('toast.success.duplicateCanvas') || "Canvas duplicated");
  };
  
  const moveElementToCanvas = useCallback((elementId: string, targetCanvasIndex: number) => {
    if (
      targetCanvasIndex < 0 || 
      targetCanvasIndex >= canvases.length || 
      targetCanvasIndex === activeCanvasIndex
    ) {
      return;
    }
    
    const elementToMove = elements.find(el => el.id === elementId);
    if (!elementToMove) {
      return;
    }
    
    const elementCopy = JSON.parse(JSON.stringify(elementToMove));
    
    const updatedCanvases = [...canvases];
    updatedCanvases[targetCanvasIndex].elements.push(elementCopy);
    
    updatedCanvases[activeCanvasIndex].elements = updatedCanvases[activeCanvasIndex].elements.filter(
      el => el.id !== elementId
    );
    
    setCanvases(updatedCanvases);
    addToHistory(updatedCanvases);
    
    if (activeElement && activeElement.id === elementId) {
      setActiveElement(null);
    }

    // Remove from selected elements
    setSelectedElementIds(prev => prev.filter(id => id !== elementId));
    
    toast.success(`Element moved to ${canvases[targetCanvasIndex].name}`);
  }, [canvases, activeCanvasIndex, elements, activeElement]);

  // Methods for multi-select
  const selectElement = (id: string, isMultiSelect: boolean = false) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    setActiveElement(element);
    
    if (isMultiSelect) {
      // Toggle selection
      setSelectedElementIds(prev => 
        prev.includes(id) 
          ? prev.filter(elId => elId !== id)
          : [...prev, id]
      );
    } else {
      // Set as single selection
      setSelectedElementIds([id]);
    }
  };

  const selectMultipleElements = (ids: string[]) => {
    if (ids.length === 0) {
      setActiveElement(null);
      setSelectedElementIds([]);
      return;
    }

    // Set the first element as active for properties panel
    const firstElement = elements.find(el => el.id === ids[0]);
    if (firstElement) {
      setActiveElement(firstElement);
    }
    
    setSelectedElementIds(ids);
  };

  const clearSelection = () => {
    setActiveElement(null);
    setSelectedElementIds([]);
  };
  
  const reorderCanvases = (sourceIndex: number, targetIndex: number) => {
    if (
      sourceIndex < 0 || 
      sourceIndex >= canvases.length || 
      targetIndex < 0 || 
      targetIndex >= canvases.length ||
      sourceIndex === targetIndex
    ) {
      return;
    }
    
    const updatedCanvases = [...canvases];
    const [movedCanvas] = updatedCanvases.splice(sourceIndex, 1);
    updatedCanvases.splice(targetIndex, 0, movedCanvas);
    
    setCanvases(updatedCanvases);
    
    if (activeCanvasIndex === sourceIndex) {
      setActiveCanvasIndex(targetIndex);
    } else if (
      (sourceIndex < activeCanvasIndex && targetIndex >= activeCanvasIndex) ||
      (sourceIndex > activeCanvasIndex && targetIndex <= activeCanvasIndex)
    ) {
      setActiveCanvasIndex(
        sourceIndex < activeCanvasIndex ? activeCanvasIndex - 1 : activeCanvasIndex + 1
      );
    }
    
    addToHistory(updatedCanvases);
    toast.success(t('toast.success.reorderCanvas') || "Canvas order updated");
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

      // Update selected ids
      const newSelectedIds = selectedElementIds.filter(id => {
        const activeCanvas = previousState[activeCanvasIndex];
        return activeCanvas?.elements.some(e => e.id === id);
      });
      setSelectedElementIds(newSelectedIds);
      
      toast.success(t('toast.success.undo'));
    } else {
      toast.info(t('toast.info.noMoreUndo'));
    }
  }, [historyIndex, history, activeElement, activeCanvasIndex, t, selectedElementIds]);
  
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

      // Update selected ids
      const newSelectedIds = selectedElementIds.filter(id => {
        const activeCanvas = nextState[activeCanvasIndex];
        return activeCanvas?.elements.some(e => e.id === id);
      });
      setSelectedElementIds(newSelectedIds);
      
      toast.success(t('toast.success.redo'));
    } else {
      toast.info(t('toast.info.noMoreRedo'));
    }
  }, [historyIndex, history, activeElement, activeCanvasIndex, t, selectedElementIds]);
  
  if (history.length === 0 && canvases.length > 0) {
    addToHistory(canvases);
  }
  
  const value = {
    canvases,
    activeCanvasIndex,
    elements,
    activeElement,
    selectedElementIds,
    canvasRef,
    isGameMode,
    toggleGameMode,
    setCanvasRef,
    addElement,
    updateElement,
    updateElementWithoutHistory,
    updateMultipleElements,
    updateMultipleElementsWithoutHistory,
    commitToHistory,
    removeElement,
    removeMultipleElements,
    setActiveElement,
    selectElement,
    selectMultipleElements,
    clearSelection,
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
    updateCanvasName,
    duplicateCanvas,
    reorderCanvases,
    moveElementToCanvas
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
