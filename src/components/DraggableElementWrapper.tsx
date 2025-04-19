
import { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { useAdvancedDraggable } from "@/hooks/useAdvancedDraggable";
import { getElementStyle, getRotation } from "@/utils/elementStyles";
import ElementControls from "./element/ElementControls";
import DraggableElement from "./DraggableElement";
import { toast } from "sonner";

interface DraggableElementWrapperProps {
  element: DesignElement;
  isActive: boolean;
  children: React.ReactNode;
}

const DraggableElementWrapper = ({ 
  element, 
  isActive,
  children 
}: DraggableElementWrapperProps) => {
  const { 
    updateElement,
    isGameMode
  } = useDesignState();
  
  const [showControls, setShowControls] = useState(false);
  
  // Use our advanced draggable hook
  const { 
    elementRef,
    isDragging,
    handleResizeStart,
    handleRotateStart,
    startDrag
  } = useAdvancedDraggable(element.id, {
    onDragStart: (el, x, y, scale, rotation) => {
      // Additional drag start logic if needed
    },
    onDragMove: (el, x, y, scale, rotation) => {
      // Additional drag move logic if needed
    },
    onDragEnd: (el, x, y, scale, rotation) => {
      toast.success("Position updated");
    }
  });
  
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
  
  // If element is hidden or in inventory and not active, don't render
  if ((element.isHidden || element.inInventory) && !isActive) {
    return null;
  }
  
  const rotation = getRotation(element);
  const frameTransform = `rotate(${rotation}deg)`;
  const elementStyle = getElementStyle(element, isDragging);
  
  return (
    <>
      <DraggableElement
        element={element}
        isActive={isActive}
        elementRef={elementRef}
        startDrag={startDrag}
        isDragging={isDragging}
      >
        {children}
      </DraggableElement>
      
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
    </>
  );
};

export default DraggableElementWrapper;
