
import { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { useDraggable } from "@/hooks/useDraggable";
import { useElementResize } from "@/hooks/useElementResize";
import { useElementRotation } from "@/hooks/useElementRotation";
import { getElementStyle, getRotation } from "@/utils/elementStyles";
import ElementControls from "./element/ElementControls";
import EditableText from "./element/EditableText";
import PuzzleElement from "./element/PuzzleElement";
import SequencePuzzleElement from "./element/SequencePuzzleElement";
import SliderPuzzleElement from "./element/SliderPuzzleElement";
import { Copy, Trash2, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

const DraggableElement = ({ element, isActive, children }: {
  element: DesignElement;
  isActive: boolean;
  children: React.ReactNode;
}) => {
  const { updateElement, setActiveElement, removeElement, addElement } = useDesignState();
  const { startDrag, isDragging: isDraggingFromHook } = useDraggable(element.id);
  const elementRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);

  const { isResizing, handleResizeStart } = useElementResize(element);
  const { isRotating, handleRotateStart } = useElementRotation(element, elementRef);

  const textElementTypes = ['heading', 'subheading', 'paragraph'];
  const isSequencePuzzleElement = element.type === 'sequencePuzzle';
  const isPuzzleElement = element.type === 'puzzle';
  const isSliderPuzzleElement = element.type === 'sliderPuzzle';
  const isImageElement = element.type === 'image';

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    if (isImageElement && 
        (e.target as HTMLElement).classList.contains('upload-placeholder-text')) {
      e.preventDefault();
    }
    
    setActiveElement(element);
    
    if (isEditing) return;
    
    // Only sequence puzzle requires double-click, regular puzzle gets single-click like images
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
      // For sequence puzzle elements, start drag only on double click
      startDrag(e, element.position);
      setIsDragging(true);
    }
  };

  const handlePuzzleClick = (e: React.MouseEvent) => {
    if (isPuzzleElement && !isDragging) {
      e.stopPropagation();
      // The modal is now handled directly in the PuzzleElement component
      // so we don't need to do anything here
    }
  };

  // Context menu handlers
  const handleDuplicateElement = () => {
    const newElement = { ...JSON.parse(JSON.stringify(element)) };
    // Offset the position slightly to make it clear it's a duplicate
    const offsetPosition = {
      x: element.position.x + 20,
      y: element.position.y + 20
    };
    
    // Add the new element via the addElement function which will 
    // generate a new ID and handle history
    const duplicatedElement = addElement(element.type, {
      ...newElement,
      position: offsetPosition
    });
    
    toast.success("Element duplicated");
  };

  const handleDeleteElement = () => {
    removeElement(element.id);
    toast.success("Element deleted");
  };

  const handleToggleVisibility = () => {
    const newVisibility = element.style?.display === 'none' ? 'block' : 'none';
    const actionText = newVisibility === 'none' ? 'hidden' : 'visible';
    
    updateElement(element.id, {
      style: {
        ...element.style,
        display: newVisibility
      }
    });
    
    toast.success(`Element is now ${actionText}`);
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
  const frameTransform = element.style?.transform || 'rotate(0deg)';
  const isHidden = element.style?.display === 'none';

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
  } else if (element.type === 'sliderPuzzle') {
    childContent = (
      <SliderPuzzleElement
        element={element}
        onClick={handlePuzzleClick}
      />
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <>
          <div
            ref={elementRef}
            className="canvas-element"
            style={{
              ...elementStyle,
              transition: isDragging ? 'none' : 'transform 0.1s ease',
              transform: element.style?.transform || '',
              cursor: isDragging ? 'move' : 'grab',
              willChange: isDragging ? 'transform' : 'auto',
              opacity: isHidden ? 0.4 : 1,
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleTextDoubleClick}
            draggable={false}
            onDragStart={(e) => {
              // Prevent default drag behavior for all elements
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
          </div>

          <ElementControls
            isActive={isActive}
            element={element}
            frameTransform={frameTransform}
            onResizeStart={handleResizeStart}
            onRotateStart={handleRotateStart}
            showControls={showControls || isActive || isDragging}
          />
        </>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleDuplicateElement} className="cursor-pointer flex items-center gap-2">
          <Copy className="h-4 w-4" />
          <span>Duplicate</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleToggleVisibility} className="cursor-pointer flex items-center gap-2">
          <EyeOff className="h-4 w-4" />
          <span>{isHidden ? "Show" : "Hide"}</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDeleteElement} className="cursor-pointer text-red-500 flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default DraggableElement;
