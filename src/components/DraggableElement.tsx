
import { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { InteractionAction } from "@/types/designTypes"; // Fixed import
import { useDraggable } from "@/hooks/useDraggable";
import { useElementResize } from "@/hooks/useElementResize";
import { useElementRotation } from "@/hooks/useElementRotation";
import { getElementStyle, getRotation } from "@/utils/elementStyles";
import ElementControls from "./element/ElementControls";
import EditableText from "./element/EditableText";
import PuzzleElement from "./element/PuzzleElement";
import SequencePuzzleElement from "./element/SequencePuzzleElement";
import SliderPuzzleElement from "./element/SliderPuzzleElement";
import ClickSequencePuzzleElement from "./element/ClickSequencePuzzleElement";
import InteractionMessageModal from "./element/InteractionMessageModal";
import PuzzleModal from "./element/PuzzleModal";
import SequencePuzzleModal from "./element/SequencePuzzleModal";
import { SliderPuzzleModal } from "./element/SliderPuzzleModal";
import ClickSequencePuzzleModal from "./element/ClickSequencePuzzleModal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { prepareElementForDuplication } from "@/utils/elementUtils";

const DraggableElement = ({ element, isActive, children }: {
  element: DesignElement;
  isActive: boolean;
  children: React.ReactNode;
}) => {
  const { 
    updateElement, 
    setActiveElement, 
    removeElement, 
    addElement, 
    setActiveCanvas, 
    canvases, 
    isGameMode, 
    addToInventory, 
    inventoryItems,
    draggedInventoryItem,
    setDraggedInventoryItem,
    handleItemCombination
  } = useDesignState();
  
  const { startDrag, isDragging: isDraggingFromHook } = useDraggable(element.id);
  const elementRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);
  const [currentPuzzleType, setCurrentPuzzleType] = useState<string>('puzzle');
  const [currentPuzzleConfig, setCurrentPuzzleConfig] = useState<any>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [combinationPuzzleModal, setCombinationPuzzleModal] = useState(false);
  const [combinationMessage, setCombinationMessage] = useState('');
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [actionQueue, setActionQueue] = useState<InteractionAction[]>([]);
  const [isProcessingActions, setIsProcessingActions] = useState(false);

  const { isResizing, handleResizeStart } = useElementResize(element);
  const { isRotating, handleRotateStart } = useElementRotation(element, elementRef);

  const textElementTypes = ['heading', 'subheading', 'paragraph'];
  const isSequencePuzzleElement = element.type === 'sequencePuzzle';
  const isPuzzleElement = element.type === 'puzzle';
  const isClickSequencePuzzleElement = element.type === 'clickSequencePuzzle';
  const isSliderPuzzleElement = element.type === 'sliderPuzzle';
  const isImageElement = element.type === 'image';
  
  const hasInteraction = element.interaction?.type && element.interaction.type !== 'none';
  const interactionType = element.interaction?.type || 'none';
  const interactionPuzzleType = element.interaction?.puzzleType || 'puzzle';
  
  const isInInventory = element.inInventory || inventoryItems.some(item => item.elementId === element.id);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    if (isImageElement && isGameMode) {
      e.preventDefault();
      
      if (hasInteraction) {
        handleInteraction();
      }
      return;
    }
    
    if (isGameMode) {
      if (hasInteraction) {
        handleInteraction();
      }
      return;
    }
    
    setActiveElement(element);
    
    if (isEditing) return;
    
    if (!isSequencePuzzleElement) {
      startDrag(e, element.position);
      setIsDragging(true);
    }
    
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleTextDoubleClick = (e: React.MouseEvent) => {
    if (isGameMode) {
      return;
    }
    
    if (textElementTypes.includes(element.type)) {
      e.stopPropagation();
      setIsEditing(true);
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 10);
    } else if (isSequencePuzzleElement) {
      startDrag(e, element.position);
      setIsDragging(true);
    } else if (hasInteraction && !isEditing && !isDragging) {
      e.stopPropagation();
      handleInteraction();
    }
  };

  const processActionQueue = () => {
    if (actionQueue.length === 0 || isProcessingActions) return;
    
    setIsProcessingActions(true);
    const nextAction = actionQueue[0];
    
    let shouldExecute = true;
    if (nextAction.condition === 'puzzleSolved' && !puzzleSolved) {
      shouldExecute = false;
    } else if (nextAction.condition === 'none') {
      shouldExecute = false;
    }
    
    if (shouldExecute) {
      const delay = nextAction.delay || 0;
      
      setTimeout(() => {
        executeAction(nextAction);
        
        setActionQueue(prev => prev.slice(1));
        setIsProcessingActions(false);
      }, delay);
    } else {
      setActionQueue(prev => prev.slice(1));
      setIsProcessingActions(false);
    }
  };
  
  const executeAction = (action: InteractionAction) => {
    switch (action.type) {
      case 'message':
        if (action.message) {
          setMessageContent(action.message);
          setShowMessageModal(true);
        }
        break;
        
      case 'sound':
        if (action.soundUrl) {
          const audio = new Audio(action.soundUrl);
          audio.play().catch(err => {
            console.error('Audio playback error:', err);
            toast.error('Could not play sound');
          });
        }
        break;
        
      case 'puzzle':
        setCurrentPuzzleType(action.puzzleType || 'puzzle');
        
        if (action.puzzleType === 'puzzle') {
          setCurrentPuzzleConfig(action.puzzleConfig);
        } else if (action.puzzleType === 'sequencePuzzle') {
          setCurrentPuzzleConfig(action.sequencePuzzleConfig);
        } else if (action.puzzleType === 'clickSequencePuzzle') {
          setCurrentPuzzleConfig(action.clickSequencePuzzleConfig);
        } else if (action.puzzleType === 'sliderPuzzle') {
          setCurrentPuzzleConfig(action.sliderPuzzleConfig);
        }
        
        setShowPuzzleModal(true);
        break;
        
      case 'canvasNavigation':
        if (action.targetCanvasId) {
          const targetCanvasIndex = canvases.findIndex(
            canvas => canvas.id === action.targetCanvasId
          );
          
          if (targetCanvasIndex !== -1) {
            setActiveCanvas(targetCanvasIndex);
            toast.success(`Navigated to ${canvases[targetCanvasIndex].name}`);
          } else {
            toast.error('Target canvas not found');
          }
        }
        break;
    }
  };

  const handleInteraction = () => {
    if (!hasInteraction) return;
    
    if (element.interaction?.actions && element.interaction.actions.length > 0) {
      setActionQueue(element.interaction.actions);
      setPuzzleSolved(false);
      return;
    }
    
    if (interactionType === 'message' && element.interaction?.message) {
      setMessageContent(element.interaction.message);
      setShowMessageModal(true);
    } 
    else if (interactionType === 'sound' && element.interaction?.soundUrl) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          toast.error('Could not play sound');
          console.error('Audio playback error:', err);
        });
      }
    }
    else if (interactionType === 'puzzle') {
      setCurrentPuzzleType(interactionPuzzleType);
      
      if (interactionPuzzleType === 'puzzle') {
        setCurrentPuzzleConfig(element.interaction?.puzzleConfig);
      } else if (interactionPuzzleType === 'sequencePuzzle') {
        setCurrentPuzzleConfig(element.interaction?.sequencePuzzleConfig);
      } else if (interactionPuzzleType === 'clickSequencePuzzle') {
        setCurrentPuzzleConfig(element.interaction?.clickSequencePuzzleConfig);
      } else if (interactionPuzzleType === 'sliderPuzzle') {
        setCurrentPuzzleConfig(element.interaction?.sliderPuzzleConfig);
      }
      
      setShowPuzzleModal(true);
    }
    else if (interactionType === 'canvasNavigation' && element.interaction?.targetCanvasId) {
      const targetCanvasIndex = canvases.findIndex(
        canvas => canvas.id === element.interaction?.targetCanvasId
      );
      
      if (targetCanvasIndex !== -1) {
        setActiveCanvas(targetCanvasIndex);
        toast.success(`Navigated to ${canvases[targetCanvasIndex].name}`);
      } else {
        toast.error('Target canvas not found');
      }
    }
    else if (interactionType === 'addToInventory') {
      addToInventory(element.id);
    }
  };

  const handlePuzzleClick = (e: React.MouseEvent) => {
    if (isGameMode) {
      e.stopPropagation();
      handleInteraction();
      return;
    }
    
    if (isPuzzleElement && !isDragging) {
      e.stopPropagation();
      // The modal is now handled directly in the PuzzleElement component
      // so we don't need to do anything here
    }
  };

  const handlePuzzleSolved = () => {
    setPuzzleSolved(true);
    
    setIsProcessingActions(false);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log("DraggableElement - Original element to duplicate:", element);
    
    const duplicateProps = prepareElementForDuplication(element);
    
    console.log("DraggableElement - Duplicate props before adding:", duplicateProps);
    
    addElement(element.type, duplicateProps);
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, {
      isHidden: !element.isHidden
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeElement(element.id);
  };

  const handleCombinationResult = (draggedItemId: string) => {
    if (!element.interaction?.combinationResult) return;
    
    const result = element.interaction.combinationResult;
    
    switch (result.type) {
      case 'message':
        if (result.message) {
          setCombinationMessage(result.message);
          setShowMessageModal(true);
        }
        break;
        
      case 'sound':
        if (result.soundUrl) {
          const audio = new Audio(result.soundUrl);
          audio.play().catch(err => {
            console.error('Audio playback error:', err);
            toast.error('Could not play sound');
          });
        }
        break;
        
      case 'canvasNavigation':
        if (result.targetCanvasId) {
          const targetCanvasIndex = canvases.findIndex(
            canvas => canvas.id === result.targetCanvasId
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
        setCombinationPuzzleModal(true);
        break;
    }
    
    handleItemCombination(draggedItemId, element.id);
  };

  useEffect(() => {
    processActionQueue();
  }, [actionQueue, isProcessingActions, puzzleSolved]);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleMouseEnter = () => {
      if (!isGameMode) {
        setShowControls(true);
      }
    };

    const handleMouseLeave = () => {
      if (!isDragging) {
        setShowControls(false);
      }
    };

    const element = elementRef.current;
    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (element) {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isDragging, isGameMode]);
  
  useEffect(() => {
    const handleCustomDragOver = (e: CustomEvent) => {
      if (!isGameMode || !draggedInventoryItem) return;
      
      const rect = elementRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.detail.clientX;
      const y = e.detail.clientY;
      
      const isMouseOver = 
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom;
      
      if (isMouseOver) {
        if (element.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
          setIsDropTarget(true);
        }
      } else {
        setIsDropTarget(false);
      }
    };
    
    const handleCustomDrop = (e: CustomEvent) => {
      if (!isGameMode || !draggedInventoryItem) {
        setIsDropTarget(false);
        return;
      }
      
      const rect = elementRef.current?.getBoundingClientRect();
      if (!rect) {
        setIsDropTarget(false);
        return;
      }
      
      const x = e.detail.clientX;
      const y = e.detail.clientY;
      
      const isDroppedOverThis = 
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom;
      
      if (isDroppedOverThis) {
        if (element.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
          handleCombinationResult(draggedInventoryItem.id);
        }
      }
      
      setIsDropTarget(false);
    };
    
    if (isGameMode) {
      document.addEventListener('custom-drag-over', handleCustomDragOver as EventListener);
      document.addEventListener('custom-drop', handleCustomDrop as EventListener);
    }
    
    return () => {
      document.removeEventListener('custom-drag-over', handleCustomDragOver as EventListener);
      document.removeEventListener('custom-drop', handleCustomDrop as EventListener);
    };
  }, [isGameMode, draggedInventoryItem, element.id, element.interaction?.canCombineWith, handleItemCombination]);

  useEffect(() => {
    if (showMessageModal) {
      const timer = setTimeout(() => {
        setShowMessageModal(false);
        setIsProcessingActions(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showMessageModal]);

  const elementStyle = getElementStyle(element, isDragging);
  const rotation = getRotation(element);
  const frameTransform = `rotate(${rotation}deg)`;

  let childContent = children;
  
  if (textElementTypes.includes(element.type)) {
    childContent = (
      <EditableText
        element={element}
        isEditing={isEditing && !isGameMode}
        setIsEditing={setIsEditing}
        textInputRef={textInputRef}
      />
    );
  } else if (element.type === 'puzzle') {
    childContent = (
      <PuzzleElement 
        element={element} 
        onClick={handlePuzzleClick} 
      />
    );
  } else if (element.type === 'sequencePuzzle') {
    childContent = (
      <SequencePuzzleElement
        element={element}
        onClick={handlePuzzleClick}
      />
    );
  } else if (element.type === 'clickSequencePuzzle') {
    childContent = (
      <ClickSequencePuzzleElement
        element={element}
        onClick={handlePuzzleClick}
      />
    );
  } else if (element.type === 'sliderPuzzle') {
    childContent = (
      <SliderPuzzleElement
        element={element}
        onClick={handlePuzzleClick}
      />
    );
  }

  if ((isInInventory || element.isHidden) && !isActive) {
    return null;
  }

  const renderPuzzleModal = () => {
    if (!showPuzzleModal) return null;
    
    const proxyElement = { ...element };
    
    if (currentPuzzleType === 'puzzle') {
      proxyElement.puzzleConfig = currentPuzzleConfig;
    } else if (currentPuzzleType === 'sequencePuzzle') {
      proxyElement.sequencePuzzleConfig = currentPuzzleConfig;
    } else if (currentPuzzleType === 'clickSequencePuzzle') {
      proxyElement.clickSequencePuzzleConfig = currentPuzzleConfig;
    } else if (currentPuzzleType === 'sliderPuzzle') {
      proxyElement.sliderPuzzleConfig = currentPuzzleConfig;
    }
    
    switch (currentPuzzleType) {
      case 'puzzle':
        return (
          <PuzzleModal 
            isOpen={showPuzzleModal} 
            onClose={() => {
              setShowPuzzleModal(false);
              setIsProcessingActions(false);
            }}
            element={proxyElement}
            onPuzzleSolved={handlePuzzleSolved}
          />
        );
      case 'sequencePuzzle':
        return (
          <SequencePuzzleModal 
            isOpen={showPuzzleModal} 
            onClose={() => {
              setShowPuzzleModal(false);
              setIsProcessingActions(false);
            }}
            element={proxyElement}
            onPuzzleSolved={handlePuzzleSolved}
          />
        );
      case 'clickSequencePuzzle':
        return (
          <ClickSequencePuzzleModal 
            isOpen={showPuzzleModal} 
            onClose={() => {
              setShowPuzzleModal(false);
              setIsProcessingActions(false);
            }}
            element={proxyElement}
            onPuzzleSolved={handlePuzzleSolved}
          />
        );
      case 'sliderPuzzle':
        return (
          <SliderPuzzleModal 
            isOpen={showPuzzleModal} 
            onClose={() => {
              setShowPuzzleModal(false);
              setIsProcessingActions(false);
            }}
            element={proxyElement}
            onPuzzleSolved={handlePuzzleSolved}
          />
        );
      default:
        return null;
    }
  };

  const renderCombinationPuzzleModal = () => {
    if (!combinationPuzzleModal || !element.interaction?.combinationResult) return null;
    
    const result = element.interaction.combinationResult;
    const puzzleType = result.puzzleType || 'puzzle';
    
    const createElementProxy = () => {
      const proxy = { ...element };
      
      if (puzzleType === 'puzzle' && result.puzzleConfig) {
        proxy.puzzleConfig = result.puzzleConfig;
      } 
      else if (puzzleType === 'sequencePuzzle' && result.sequencePuzzleConfig) {
        proxy.sequencePuzzleConfig = result.sequencePuzzleConfig;
      }
      else if (puzzleType === 'clickSequencePuzzle' && result.clickSequencePuzzleConfig) {
        proxy.clickSequencePuzzleConfig = result.clickSequencePuzzleConfig;
      }
      else if (puzzleType === 'sliderPuzzle' && result.sliderPuzzleConfig) {
        proxy.sliderPuzzleConfig = result.sliderPuzzleConfig;
      }
      
      return proxy;
    };
    
    const proxy = createElementProxy();
    
    switch (puzzleType) {
      case 'puzzle':
        return (
          <PuzzleModal 
            isOpen={combinationPuzzleModal} 
            onClose={() => setCombinationPuzzleModal(false)} 
            element={proxy}
            onPuzzleSolved={handlePuzzleSolved}
          />
        );
      case 'sequencePuzzle':
        return (
          <SequencePuzzleModal 
            isOpen={combinationPuzzleModal} 
            onClose={() => setCombinationPuzzleModal(false)} 
            element={proxy}
            onPuzzleSolved={handlePuzzleSolved}
          />
        );
      case 'clickSequencePuzzle':
        return (
          <ClickSequencePuzzleModal 
            isOpen={combinationPuzzleModal} 
            onClose={() => setCombinationPuzzleModal(false)} 
            element={proxy}
            onPuzzleSolved={handlePuzzleSolved}
          />
        );
      case 'sliderPuzzle':
        return (
          <SliderPuzzleModal 
            isOpen={combinationPuzzleModal} 
            onClose={() => setCombinationPuzzleModal(false)} 
            element={proxy}
            onPuzzleSolved={handlePuzzleSolved}
          />
        );
      default:
        return null;
    }
  };

  const showInteractionIndicator = hasInteraction && !isActive && !isDragging && !isGameMode;
  let indicatorStyles = "";
  
  if (showInteractionIndicator) {
    if (interactionType === 'canvasNavigation') {
      indicatorStyles = "absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full animate-pulse";
    } else if (interactionType === 'addToInventory') {
      indicatorStyles = "absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse";
    } else if (interactionType === 'combinable') {
      indicatorStyles = "absolute bottom-0 right-0 w-3 h-3 bg-purple-500 rounded-full animate-pulse";
    } else if (element.interaction?.actions && element.interaction.actions.length > 0) {
      indicatorStyles = "absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full animate-pulse";
    }
  }

  const combinedStyle = {
    ...elementStyle,
    zIndex: element.layer,
    transition: isDragging ? 'none' : 'transform 0.1s ease',
    cursor: isGameMode 
      ? (hasInteraction ? 'pointer' : 'default') 
      : (isDragging ? 'move' : (hasInteraction ? 'pointer' : 'grab')),
    willChange: isDragging ? 'transform' : 'auto',
    opacity: element.isHidden ? 0 : 1,
    position: 'absolute' as 'absolute',
    border: isGameMode && isImageElement ? 'none' : (isGameMode ? (isDropTarget ? '2px dashed #8B5CF6' : 'none') : elementStyle.border),
    outline: isGameMode && isImageElement ? 'none' : (isGameMode ? (isDropTarget ? '2px dashed #8B5CF6' : 'none') : elementStyle.outline),
    boxShadow: isGameMode && isImageElement ? 'none' : (isDropTarget ? '0 0 15px rgba(139, 92, 246, 0.5)' : elementStyle.boxShadow),
    backgroundColor: isGameMode && isImageElement ? 'transparent' : elementStyle.backgroundColor,
  };

  const createElementContent = (ref: React.RefObject<HTMLDivElement>) => (
    <div
      id={`element-${element.id}`}
      ref={ref}
      className={`canvas-element ${isDropTarget ? 'drop-target' : ''} ${isGameMode && isImageElement ? 'game-mode-image' : ''}`}
      style={combinedStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={isGameMode ? undefined : handleTextDoubleClick}
      onClick={isGameMode && hasInteraction ? () => handleInteraction() : undefined}
      draggable={isGameMode && isImageElement ? false : undefined}
    >
      {childContent}
      {showInteractionIndicator && (
        <div className={indicatorStyles} title={
          interactionType === 'canvasNavigation' 
            ? "Click to navigate to another canvas" 
            : interactionType === 'addToInventory'
              ? "Click to add to inventory"
              : interactionType === 'combinable'
                ? "Can be combined with inventory items"
                : element.interaction?.actions && element.interaction.actions.length > 0
                  ? "Has interaction sequence"
                  : ""
        }></div>
      )}
    </div>
  );

  return (
    <>
      {isGameMode ? (
        createElementContent(elementRef)
      ) : (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            {createElementContent(elementRef)}
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handleDuplicate} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              <span>Duplicate</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={handleToggleVisibility} className="flex items-center gap-2">
              {element.isHidden ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Show</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Hide</span>
                </>
              )}
            </ContextMenuItem>
            <ContextMenuItem onClick={handleDelete} className="flex items-center gap-2 text-red-500">
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}

      {!isGameMode && (
        <ElementControls
          isActive={isActive}
          element={element}
          frameTransform={frameTransform}
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
          showControls={showControls && isActive && !element.isHidden}
        />
      )}
      
      {interactionType === 'sound' && element.interaction?.soundUrl && (
        <audio 
          ref={audioRef}
          src={element.interaction.soundUrl}
          style={{ display: 'none' }}
        />
      )}
      
      {(interactionType === 'message' || messageContent) && (
        <InteractionMessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setMessageContent("");
            setIsProcessingActions(false);
          }}
          message={messageContent || element.interaction?.message || ''}
        />
      )}
      
      {renderPuzzleModal()}
      {renderCombinationPuzzleModal()}
      
      {combinationMessage && (
        <InteractionMessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setCombinationMessage('');
            setIsProcessingActions(false);
          }}
          message={combinationMessage}
        />
      )}
    </>
  );
};

export default DraggableElement;
