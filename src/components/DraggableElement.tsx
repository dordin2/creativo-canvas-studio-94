
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

const DraggableElement = ({ element, isActive, children }: {
  element: DesignElement;
  isActive: boolean;
  children: React.ReactNode;
}) => {
  const { updateElement, setActiveElement } = useDesignState();
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    setActiveElement(element);
    
    // Don't start dragging if editing text
    if (isEditing) return;
    
    // For all elements, including images, start dragging immediately
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
    if ((element.type === 'puzzle' || element.type === 'sequencePuzzle') && !isDragging) {
      e.stopPropagation();
      // The modal is now handled directly in the PuzzleElement component
      // so we don't need to do anything here
    }
  };

  const handleDragHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveElement(element);
    startDrag(e, element.position);
    setIsDragging(true);
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
    // Show controls when element is hovered
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
  }

  return (
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
          pointerEvents: 'auto'
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleTextDoubleClick}
      >
        {childContent}
      </div>

      <ElementControls
        isActive={isActive}
        element={element}
        frameTransform={frameTransform}
        onResizeStart={handleResizeStart}
        onRotateStart={handleRotateStart}
        onDragHandleMouseDown={handleDragHandleMouseDown}
        showControls={showControls || isActive || isDragging}
      />
    </>
  );
};

export default DraggableElement;
