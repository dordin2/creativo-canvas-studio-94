
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
  const isSequencePuzzleElement = element.type === 'sequencePuzzle';
  const isPuzzleElement = element.type === 'puzzle';
  const isImageElement = element.type === 'image';

  // This will track if we're interacting with the placeholder or the modal
  const [isOpeningModal, setIsOpeningModal] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    if (isImageElement && 
        (e.target as HTMLElement).classList.contains('upload-placeholder-text')) {
      e.preventDefault();
    }
    
    setActiveElement(element);
    
    if (isEditing) return;
    
    // For all element types, including sequencePuzzle placeholder (but not when opening modal)
    // start drag on single click
    if (!isOpeningModal) {
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
    }
  };

  const handlePuzzleClick = (e: React.MouseEvent) => {
    if (isPuzzleElement && !isDragging) {
      e.stopPropagation();
      // The modal is now handled directly in the PuzzleElement component
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
        onClick={(e) => {
          // When we're actually opening the modal, set the flag to prevent dragging
          setIsOpeningModal(true);
          
          // Reset the flag after a short delay
          setTimeout(() => {
            setIsOpeningModal(false);
          }, 300);
          
          // Handle the click normally
          handlePuzzleClick(e);
        }}
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
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleTextDoubleClick}
        draggable={false}
        onDragStart={(e) => {
          // Prevent default drag behavior for all elements
          e.preventDefault();
        }}
        onDragOver={(e) => {
          if (isImageElement || isPuzzleElement || isSequencePuzzleElement) {
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
        // We remove the onDragHandleMouseDown prop since we're removing the drag handle
        showControls={showControls || isActive || isDragging}
      />
    </>
  );
};

export default DraggableElement;
