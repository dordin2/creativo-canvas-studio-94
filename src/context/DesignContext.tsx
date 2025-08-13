import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { useGameModeToast } from "@/hooks/useGameModeToast";
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

interface DesignProviderProps {
  children: ReactNode;
  initialState?: {
    canvases?: Canvas[];
    activeCanvasIndex?: number;
    isGameMode?: boolean;
  };
}

export const DesignProvider = ({ 
  children, 
  initialState = {} 
}: DesignProviderProps) => {
  const [canvases, setCanvases] = useState<Canvas[]>(
    initialState.canvases || [
      { id: generateId(), name: "Canvas 1", elements: [] }
    ]
  );
  const [activeCanvasIndex, setActiveCanvasIndex] = useState<number>(
    initialState.activeCanvasIndex !== undefined ? initialState.activeCanvasIndex : 0
  );
  const [activeElement, setActiveElement] = useState<DesignElement | null>(null);
  const [canvasRef, setCanvasRefState] = useState<HTMLDivElement | null>(null);
  const [history, setHistory] = useState<Canvas[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isGameMode, setIsGameMode] = useState<boolean>(initialState.isGameMode || false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [draggedInventoryItem, setDraggedInventoryItem] = useState<DesignElement | null>(null);
  const [gameModeState, setGameModeState] = useState<{
    canvases: Canvas[],
    inventoryItems: InventoryItem[]
  } | null>(null);
  const [historyInitialized, setHistoryInitialized] = useState<boolean>(false);
  const [isTemporaryOperation, setIsTemporaryOperation] = useState<boolean>(false);
  
  // User interaction state for zoom control
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
  const [userSetZoom, setUserSetZoom] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  
  const { t } = useLanguage();
  const toast = useGameModeToast(isGameMode);
  
  const setCanvasRef = (ref: HTMLDivElement) => {
    setCanvasRefState(ref);
  };
  
  const setUserInteraction = useCallback((interacting: boolean) => {
    setIsUserInteracting(interacting);
  }, []);
  
  const setManualZoom = useCallback((isManual: boolean) => {
    setUserSetZoom(isManual);
  }, []);
  
  const setResizeMode = useCallback((resizing: boolean) => {
    setIsResizing(resizing);
  }, []);
  
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
    
    const itemExists = inventoryItems.some(
      item => item.elementId === elementId && item.canvasId === currentCanvas.id
    );
    
    if (itemExists) {
      return;
    }

    setInventoryItems(prev => [
      ...prev, 
      { elementId, canvasId: currentCanvas.id }
    ]);

    updateElement(elementId, { 
      isHidden: true, 
      inInventory: true 
    });
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
  };
  
  const handleItemCombination = (inventoryItemId: string, targetElementId: string) => {
    const inventoryElement = getElementFromInventory(inventoryItemId);
    if (!inventoryElement) return;
    
    const currentCanvas = canvases[activeCanvasIndex];
    if (!currentCanvas) return;
    
    const targetElement = currentCanvas.elements.find(el => el.id === targetElementId);
    if (!targetElement) return;
    
    if (!targetElement.interaction?.canCombineWith?.includes(inventoryItemId)) {
      return;
    }
    
    const combinationResult = targetElement.interaction.combinationResult;
    
    if (combinationResult) {
      switch (combinationResult.type) {
        case 'message':
          break;
          
        case 'sound':
          if (combinationResult.soundUrl) {
            const audio = new Audio(combinationResult.soundUrl);
            audio.play().catch(err => {
              console.error('Audio playback error:', err);
            });
          }
          break;
          
        case 'canvasNavigation':
          if (combinationResult.targetCanvasId) {
            const targetCanvasIndex = canvases.findIndex(
              canvas => canvas.id === combinationResult.targetCanvasId
            );
            
            if (targetCanvasIndex !== -1) {
              setActiveCanvas(targetCanvasIndex);
            }
          }
          break;
          
        case 'puzzle':
          break;
          
        default:
          break;
      }
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
    // Don't add to history if we're in a temporary operation
    if (isTemporaryOperation) return;
    
    // Check if the new state is actually different from the current state
    const currentState = history[historyIndex];
    if (currentState) {
      try {
        const currentStateStr = JSON.stringify(currentState);
        const newStateStr = JSON.stringify(newCanvases);
        if (currentStateStr === newStateStr) {
          return; // No changes, don't add to history
        }
      } catch (e) {
        // If comparison fails, proceed with adding to history
        console.warn('History comparison failed:', e);
      }
    }
    
    setHistory(prevHistory => {
      const newIndex = historyIndex + 1;
      const newHistory = prevHistory.slice(0, newIndex);
      newHistory.push(JSON.parse(JSON.stringify(newCanvases)));
      return newHistory;
    });
    
    setHistoryIndex(prevIndex => prevIndex + 1);
  }, [historyIndex, isTemporaryOperation]);
  
  const addToHistoryDirect = useCallback((newCanvases: Canvas[]) => {
    // Always add to history regardless of temporary operation flag
    const currentState = history[historyIndex];
    if (currentState) {
      try {
        const currentStateStr = JSON.stringify(currentState);
        const newStateStr = JSON.stringify(newCanvases);
        if (currentStateStr === newStateStr) {
          return; // No changes, don't add to history
        }
      } catch (e) {
        console.warn('History comparison failed:', e);
      }
    }
    
    setHistory(prevHistory => {
      const newIndex = historyIndex + 1;
      const newHistory = prevHistory.slice(0, newIndex);
      newHistory.push(JSON.parse(JSON.stringify(newCanvases)));
      return newHistory;
    });
    
    setHistoryIndex(prevIndex => prevIndex + 1);
  }, [historyIndex, history]);
  
  const resetHistory = useCallback((newCanvases: Canvas[]) => {
    const newHistory = [JSON.parse(JSON.stringify(newCanvases))];
    setHistory(newHistory);
    setHistoryIndex(0);
    setHistoryInitialized(true);
  }, []);
  
  const elements = activeCanvasIndex >= 0 && activeCanvasIndex < canvases.length 
    ? (canvases[activeCanvasIndex]?.elements || []) 
    : [];
  
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
  
  const startTemporaryOperation = useCallback(() => {
    setIsTemporaryOperation(true);
  }, []);
  
  const commitToHistory = useCallback(() => {
    // Add current state to history BEFORE resetting the flag
    addToHistoryDirect(canvases);
    setIsTemporaryOperation(false);
  }, [canvases, addToHistoryDirect]);
  
  const handleImageUpload = (id: string, file: File) => {
    const canvasDimensions = canvasRef ? {
      width: canvasRef.clientWidth,
      height: canvasRef.clientHeight
    } : undefined;
    
    processImageUpload(
      file, 
      (updatedData) => {
        updateElement(id, updatedData);
      },
      canvasDimensions?.width,
      canvasDimensions?.height
    );
  };
  
  const addElement = (type: ElementType, props?: any): DesignElement => {
    if (!canvases || activeCanvasIndex < 0 || activeCanvasIndex >= canvases.length) {
      console.error("Invalid canvas state when trying to add element");
      return createNewElement(type, { x: 0, y: 0 }, 0, props);
    }
    
    const position = getDefaultPosition(canvasRef);
    const newLayer = getHighestLayer(elements);
    
    if (type === 'background') {
      const { elements: updatedElements, newElement } = handleBackgroundLayer(elements, props);
      
      if (newElement) {
        const updatedCanvases = [...canvases];
        
        if (activeCanvasIndex >= 0 && activeCanvasIndex < updatedCanvases.length) {
          updatedCanvases[activeCanvasIndex].elements = updatedElements;
          
          setCanvases(updatedCanvases);
          addToHistory(updatedCanvases);
          setActiveElement(newElement);
          return newElement;
        }
      }
      
      const backgroundElement = createNewElement(type, position, 0, props);
      const updatedCanvases = [...canvases];
      
      if (activeCanvasIndex >= 0 && activeCanvasIndex < updatedCanvases.length) {
        updatedCanvases[activeCanvasIndex].elements = [...elements, backgroundElement];
        
        setCanvases(updatedCanvases);
        addToHistory(updatedCanvases);
        setActiveElement(backgroundElement);
        return backgroundElement;
      }
      
      return backgroundElement;
    }
    
    const newElement = createNewElement(type, position, newLayer, props);
    
    if (type === 'image' && props?.dataUrl) {
      console.log("DesignContext - Creating new image element with dataUrl length:", 
        props.dataUrl.length);
      
      if (props.thumbnailDataUrl) {
        console.log("DesignContext - Image has thumbnail preview");
      }
    }
    
    const updatedCanvases = [...canvases];
    
    if (activeCanvasIndex >= 0 && activeCanvasIndex < updatedCanvases.length) {
      updatedCanvases[activeCanvasIndex].elements = [...elements, newElement];
      
      setCanvases(updatedCanvases);
      addToHistory(updatedCanvases);
      setActiveElement(newElement);
    }
    
    return newElement;
  };
  
  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    const updatedCanvases = [...canvases];
    
    if (activeCanvasIndex < 0 || activeCanvasIndex >= updatedCanvases.length) {
      console.error("Invalid activeCanvasIndex:", activeCanvasIndex);
      return;
    }
    
    const activeCanvas = updatedCanvases[activeCanvasIndex];
    
    if (!activeCanvas) {
      console.error("No active canvas found");
      return;
    }
    
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
    
    if (activeCanvasIndex < 0 || activeCanvasIndex >= updatedCanvases.length) {
      return;
    }
    
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
  };
  
  const removeElement = (id: string) => {
    const updatedCanvases = [...canvases];
    
    if (activeCanvasIndex < 0 || activeCanvasIndex >= updatedCanvases.length) {
      return;
    }
    
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
  };
  
  const removeCanvas = (index: number) => {
    if (canvases.length <= 1) {
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
    }
  };
  
  const duplicateCanvas = (index: number) => {
    if (index < 0 || index >= canvases.length) {
      console.error("Invalid canvas index for duplication:", index);
      return;
    }
    
    const sourceCanvas = canvases[index];
    if (!sourceCanvas) return;
    
    const duplicatedElements = sourceCanvas.elements.map(element => {
      const duplicatedElement = prepareElementForDuplication(element);
      return {
        ...duplicatedElement,
        id: generateId(),
        position: { ...element.position }
      };
    });
    
    const duplicatedCanvas: Canvas = {
      id: generateId(),
      name: `${sourceCanvas.name} (Copy)`,
      elements: duplicatedElements as DesignElement[]
    };
    
    const updatedCanvases = [...canvases];
    updatedCanvases.splice(index + 1, 0, duplicatedCanvas);
    
    setCanvases(updatedCanvases);
    setActiveCanvasIndex(index + 1);
    addToHistory(updatedCanvases);
    setActiveElement(null);
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
      
      if (elementToMove.thumbnailDataUrl) {
        elementCopy.thumbnailDataUrl = elementToMove.thumbnailDataUrl;
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
  };
  
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      setCanvases(JSON.parse(JSON.stringify(previousState)));
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
    }
  }, [historyIndex, history, activeElement, activeCanvasIndex]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      setCanvases(JSON.parse(JSON.stringify(nextState)));
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
    }
  }, [historyIndex, history, activeElement, activeCanvasIndex]);
  
  // Modified useEffect to prevent conflict with resetHistory
  useEffect(() => {
    if (history.length === 0 && canvases.length > 0 && !historyInitialized) {
      addToHistory(canvases);
      setHistoryInitialized(true);
    }
  }, [canvases, history.length, addToHistory, historyInitialized]);
  
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
    isUserInteracting,
    userSetZoom,
    isResizing,
    toggleGameMode,
    toggleInventory,
    setCanvasRef,
    addElement,
    updateElement,
    updateElementWithoutHistory,
    commitToHistory,
    startTemporaryOperation,
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
    handleItemCombination,
    setCanvases,
    resetHistory,
    setUserInteraction,
    setManualZoom,
    setResizeMode
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
