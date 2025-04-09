import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { 
  ElementType, 
  DesignElement, 
  DesignContextType,
  Canvas,
  generateId,
  InteractionType,
  InventoryItem,
  CombinationResultType
} from "@/types/designTypes";
import { 
  getDefaultPosition, 
  createNewElement 
} from "@/utils/elementFactory";
import { processImageUpload } from "@/utils/imageUploader";
import { getHighestLayer, handleBackgroundLayer } from "@/utils/layerUtils";
import { useLanguage } from "@/context/LanguageContext";
import { prepareElementForDuplication } from "@/utils/elementUtils";

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
  const [isGameMode, setIsGameMode] = useState<boolean>(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [draggedInventoryItem, setDraggedInventoryItem] = useState<DesignElement | null>(null);
  const [gameModeState, setGameModeState] = useState<{
    canvases: Canvas[],
    inventoryItems: InventoryItem[]
  } | null>(null);
  const { t } = useLanguage();
  
  const setCanvasRef = (ref: HTMLDivElement) => {
    setCanvasRefState(ref);
  };
  
  const toggleGameMode = () => {
    if (isGameMode) {
      if (gameModeState) {
        setCanvases(gameModeState.canvases);
        setInventoryItems([]);
      }
    } else {
      setGameModeState({
        canvases: JSON.parse(JSON.stringify(canvases)),
        inventoryItems: JSON.parse(JSON.stringify(inventoryItems))
      });
    }
    
    setIsGameMode(prev => !prev);
    if (isGameMode) {
      setActiveElement(null);
    }
  };
  
  useEffect(() => {
    if (isGameMode && gameModeState) {
      setInventoryItems(gameModeState.inventoryItems);
    }
  }, [isGameMode, gameModeState]);
  
  const toggleInventory = () => {
    setShowInventory(prev => !prev);
  };
  
  const addToInventory = (elementId: string) => {
    const currentCanvas = canvases[activeCanvasIndex];
    if (!currentCanvas) return;

    const element = currentCanvas.elements.find(el => el.id === elementId);
    if (!element) return;

    setInventoryItems(prev => [
      ...prev, 
      { elementId, canvasId: currentCanvas.id }
    ]);

    updateElement(elementId, { 
      isHidden: true, 
      inInventory: true 
    });

    toast.success("Item added to inventory");
  };

  const removeFromInventory = (elementId: string) => {
    const inventoryItem = inventoryItems.find(item => item.elementId === elementId);
    if (!inventoryItem) return;

    const canvasIndex = canvases.findIndex(canvas => canvas.id === inventoryItem.canvasId);
    if (canvasIndex === -1) return;

    const updatedCanvases = [...canvases];
    const canvas = updatedCanvases[canvasIndex];
    
    const elementIndex = canvas.elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) return;
    
    const updatedElements = [...canvas.elements];
    updatedElements[elementIndex] = {
      ...updatedElements[elementIndex],
      isHidden: false,
      inInventory: false
    };
    
    canvas.elements = updatedElements;
    setCanvases(updatedCanvases);
    
    setInventoryItems(prev => prev.filter(item => item.elementId !== elementId));
    
    toast.success("Item removed from inventory");
  };
  
  const handleItemCombination = (inventoryItemId: string, targetElementId: string) => {
    const inventoryElement = getElementFromInventory(inventoryItemId);
    if (!inventoryElement) return;
    
    const currentCanvas = canvases[activeCanvasIndex];
    if (!currentCanvas) return;
    
    const targetElement = currentCanvas.elements.find(el => el.id === targetElementId);
    if (!targetElement) return;
    
    if (!targetElement.interaction?.canCombineWith?.includes(inventoryItemId)) {
      toast.error("These items cannot be combined");
      return;
    }
    
    const combinationResult = targetElement.interaction.combinationResult;
    
    if (combinationResult) {
      switch (combinationResult.type) {
        case 'message':
          if (combinationResult.message) {
            toast.success(combinationResult.message);
          } else {
            toast.success("Items combined successfully!");
          }
          break;
          
        case 'sound':
          if (combinationResult.soundUrl) {
            const audio = new Audio(combinationResult.soundUrl);
            audio.play().catch(err => {
              console.error('Audio playback error:', err);
              toast.error('Could not play sound');
            });
          }
          toast.success("Items combined successfully!");
          break;
          
        case 'canvasNavigation':
          if (combinationResult.targetCanvasId) {
            const targetCanvasIndex = canvases.findIndex(
              canvas => canvas.id === combinationResult.targetCanvasId
            );
            
            if (targetCanvasIndex !== -1) {
              setActiveCanvas(targetCanvasIndex);
              toast.success(`Navigated to ${canvases[targetCanvasIndex].name}`);
            } else {
              toast.error('Target canvas not found');
            }
          }
          break;
          
        case 'puzzle':
          toast.info("Puzzle unlocked!");
          break;
          
        default:
          toast.success("Items combined successfully!");
          break;
      }
    } else if (targetElement.interaction.message) {
      toast.success(targetElement.interaction.message);
    } else {
      toast.success("Items combined successfully!");
    }
    
    removeFromInventory(inventoryItemId);
  };
  
  const getElementFromInventory = (elementId: string): DesignElement | null => {
    const inventoryItem = inventoryItems.find(item => item.elementId === elementId);
    if (!inventoryItem) return null;
    
    const canvas = canvases.find(c => c.id === inventoryItem.canvasId);
    if (!canvas) return null;
    
    return canvas.elements.find(el => el.id === elementId) || null;
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
    
    if (type === 'image' && props?.dataUrl) {
      console.log("DesignContext - Creating new image element with dataUrl length:", 
        props.dataUrl.length);
    }
    
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
    
    const elementCopy = prepareElementForDuplication(elementToMove);
    elementCopy.id = generateId();
    
    if (elementToMove.type === 'image') {
      console.log("DesignContext - Moving image element with dataUrl:", 
        elementToMove.dataUrl ? "exists" : "missing",
        elementToMove.dataUrl ? `length: ${elementToMove.dataUrl.length}` : "");
        
      if (elementToMove.dataUrl) {
        elementCopy.dataUrl = elementToMove.dataUrl;
      }
    }
    
    const updatedCanvases = [...canvases];
    updatedCanvases[targetCanvasIndex].elements.push(elementCopy as DesignElement);
    
    updatedCanvases[activeCanvasIndex].elements = updatedCanvases[activeCanvasIndex].elements.filter(
      el => el.id !== elementId
    );
    
    setCanvases(updatedCanvases);
    addToHistory(updatedCanvases);
    
    if (activeElement && activeElement.id === elementId) {
      setActiveElement(null);
    }
    
    toast.success(`Element moved to ${canvases[targetCanvasIndex].name}`);
  }, [canvases, activeCanvasIndex, elements, activeElement]);
  
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
    isGameMode,
    inventoryItems,
    showInventory,
    draggedInventoryItem,
    toggleGameMode,
    toggleInventory,
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
    updateCanvasName,
    duplicateCanvas,
    reorderCanvases,
    moveElementToCanvas,
    addToInventory,
    removeFromInventory,
    setDraggedInventoryItem,
    handleItemCombination
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
