
import { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { InteractionConfig } from "@/types/designTypes";
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
import InteractionMessage from "./element/InteractionMessage";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Copy, Trash2, Eye, EyeOff, Zap, ZapOff } from "lucide-react";
import { toast } from "sonner";

const DraggableElement = ({ element, isActive, children }: {
  element: DesignElement;
  isActive: boolean;
  children: React.ReactNode;
}) => {
  const { updateElement, setActiveElement, removeElement, addElement } = useDesignState();
  const { startDrag, isDragging: isDraggingFromHook } = useDraggable(element.id);
  const elementRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageConfig, setMessageConfig] = useState<{ 
    text: string; 
    color?: string; 
    position?: 'top' | 'center' | 'bottom' 
  }>({ text: '' });

  const { isResizing, handleResizeStart } = useElementResize(element);
  const { isRotating, handleRotateStart } = useElementRotation(element, elementRef);

  const textElementTypes = ['heading', 'subheading', 'paragraph'];
  const isSequencePuzzleElement = element.type === 'sequencePuzzle';
  const isPuzzleElement = element.type === 'puzzle';
  const isClickSequencePuzzleElement = element.type === 'clickSequencePuzzle';
  const isSliderPuzzleElement = element.type === 'sliderPuzzle';
  const isImageElement = element.type === 'image';

  const handleInteraction = () => {
    if (!element.isInteractive || !element.interactionConfig) return;
    
    const config = element.interactionConfig;
    
    switch (config.type) {
      case 'puzzle':
        if (config.puzzle) {
          toast.info("Opening puzzle");
        }
        break;
      case 'message':
        if (config.message) {
          setMessageConfig({
            text: config.message.text,
            color: config.message.color,
            position: config.message.position
          });
          setShowMessage(true);
          setTimeout(() => {
            setShowMessage(false);
          }, config.message.duration);
        }
        break;
      case 'sound':
        if (config.sound && config.sound.soundUrl) {
          if (audioRef.current) {
            audioRef.current.volume = config.sound.volume;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => {
              console.error("Error playing audio:", err);
              toast.error("Failed to play sound");
            });
          }
        }
        break;
      default:
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    if (isImageElement && 
        (e.target as HTMLElement).classList.contains('upload-placeholder-text')) {
      e.preventDefault();
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
    } else if (element.isInteractive) {
      e.stopPropagation();
      handleInteraction();
    }
  };

  const handlePuzzleClick = (e: React.MouseEvent) => {
    if (isPuzzleElement && !isDragging) {
      e.stopPropagation();
    }
  };

  const handleDuplicate = () => {
    const duplicateProps = {
      ...element,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20
      }
    };
    
    delete (duplicateProps as any).id;
    
    addElement(element.type, duplicateProps);
  };

  const handleToggleVisibility = () => {
    updateElement(element.id, {
      isHidden: !element.isHidden
    });
  };

  const handleToggleInteractive = () => {
    updateElement(element.id, {
      isInteractive: !element.isInteractive,
      interactionConfig: element.interactionConfig || {
        type: 'none'
      }
    });
  };

  const handleDelete = () => {
    removeElement(element.id);
  };

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
      setShowControls(true);
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
  }, [isDragging]);

  const elementStyle = getElementStyle(element, isDragging);
  const frameTransform = element.style?.transform?.toString() || 'rotate(0deg)';

  let childContent = children;
  
  if (textElementTypes.includes(element.type)) {
    childContent = (
      <EditableText
        element={element}
        isEditing={isEditing}
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

  if (element.isHidden && !isActive) {
    return null;
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={elementRef}
            className={`canvas-element ${element.isInteractive ? 'cursor-pointer' : ''}`}
            style={{
              ...elementStyle,
              transition: isDragging ? 'none' : 'transform 0.1s ease',
              transform: element.style?.transform as string || '',
              cursor: isDragging ? 'move' : (element.isInteractive ? 'pointer' : 'grab'),
              willChange: isDragging ? 'transform' : 'auto',
              opacity: element.isHidden ? 0 : 1,
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleTextDoubleClick}
            draggable={false}
            onDragStart={(e) => {
              e.preventDefault();
            }}
            onDragOver={(e) => {
              if (isImageElement || isPuzzleElement) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {childContent}
            {showMessage && <InteractionMessage config={messageConfig} />}
            {element.interactionConfig?.type === 'sound' && 
              element.interactionConfig.sound?.soundUrl && (
              <audio 
                ref={audioRef} 
                src={element.interactionConfig.sound.soundUrl} 
                preload="auto"
                style={{ display: 'none' }} 
              />
            )}
          </div>
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
          <ContextMenuItem onClick={handleToggleInteractive} className="flex items-center gap-2">
            {element.isInteractive ? (
              <>
                <ZapOff className="h-4 w-4" />
                <span>Disable Interaction</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>Enable Interaction</span>
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDelete} className="flex items-center gap-2 text-red-500">
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ElementControls
        isActive={isActive}
        element={element}
        frameTransform={frameTransform}
        onResizeStart={handleResizeStart}
        onRotateStart={handleRotateStart}
        showControls={showControls && isActive && !element.isHidden}
        onActivateInteraction={handleInteraction}
      />
    </>
  );
};

export default DraggableElement;
