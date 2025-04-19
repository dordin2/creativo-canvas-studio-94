
import { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { useAdvancedDraggable } from "@/hooks/useAdvancedDraggable";
import { getElementStyle, getRotation } from "@/utils/elementStyles";
import ElementControls from "./element/ElementControls";
import DraggableElement from "./DraggableElement";

interface DraggableElementWrapperProps {
  element: DesignElement;
  isActive: boolean;
  children: React.ReactNode;
  canvasScale?: number;
}

const DraggableElementWrapper = ({ 
  element, 
  isActive,
  children,
  canvasScale = 1
}: DraggableElementWrapperProps) => {
  const { 
    updateElement,
    isGameMode
  } = useDesignState();
  
  const [showControls, setShowControls] = useState(false);
  
  const { 
    elementRef,
    isDragging,
    handleResizeStart,
    handleRotateStart,
    startDrag
  } = useAdvancedDraggable(element.id, {});
  
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
  }, [isDragging, isGameMode, elementRef]);
  
  if ((element.isHidden || element.inInventory) && !isActive) {
    return null;
  }
  
  return (
    <>
      <DraggableElement
        element={element}
        isActive={isActive}
        elementRef={elementRef}
        startDrag={startDrag}
        isDragging={isDragging}
        canvasScale={canvasScale}
      >
        {children}
      </DraggableElement>
      
      {!isGameMode && (
        <ElementControls
          isActive={isActive}
          element={element}
          frameTransform={`rotate(${getRotation(element)}deg)`}
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
          showControls={showControls && isActive && !element.isHidden}
          canvasScale={canvasScale}
        />
      )}
    </>
  );
};

export default DraggableElementWrapper;
