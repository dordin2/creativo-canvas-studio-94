
import { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { useDraggable } from "@/hooks/useDraggable";
import { useElementResize } from "@/hooks/useElementResize";
import { useElementRotation } from "@/hooks/useElementRotation";
import { getElementStyle, getRotation } from "@/utils/elementStyles";
import ElementControls from "./element/ElementControls";
import EditableText from "./element/EditableText";
import PuzzleElement from "./element/PuzzleElement";
import PuzzleModal from "./element/PuzzleModal";

interface DraggableElementProps {
  element: DesignElement;
  isActive: boolean;
  children: React.ReactNode;
}

const DraggableElement = ({ element, isActive, children }: DraggableElementProps) => {
  const { updateElement, setActiveElement } = useDesignState();
  const { startDrag, isDragging: isDraggingFromHook } = useDraggable(element.id);
  const elementRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isPuzzleModalOpen, setIsPuzzleModalOpen] = useState(false);

  const { isResizing, handleResizeStart } = useElementResize(element);
  const { isRotating, handleRotateStart } = useElementRotation(element, elementRef);

  const textElementTypes = ['heading', 'subheading', 'paragraph'];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    if (element.type === 'image' && 
        (e.target as HTMLElement).classList.contains('upload-placeholder-text')) {
      e.preventDefault();
    }
    
    setActiveElement(element);
    
    if (isEditing) return;
    
    startDrag(e, element.position);
    setIsDragging(true);
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
    }
  };

  const handlePuzzleClick = (e: React.MouseEvent) => {
    if (element.type === 'puzzle' && !isDragging) {
      e.stopPropagation();
      setIsPuzzleModalOpen(true);
    }
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

  const elementStyle = getElementStyle(element, isDragging);
  const frameTransform = element.style?.transform || 'rotate(0deg)';

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
  }

  return (
    <>
      <div
        ref={elementRef}
        className="canvas-element"
        style={elementStyle}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleTextDoubleClick}
        onDragOver={(e) => {
          if (element.type === 'image') {
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
      />

      {element.type === 'puzzle' && (
        <PuzzleModal 
          isOpen={isPuzzleModalOpen} 
          onClose={() => setIsPuzzleModalOpen(false)} 
          element={element} 
        />
      )}
    </>
  );
};

export default DraggableElement;
