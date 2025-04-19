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
  const frameRef = useRef<HTMLDivElement>(null);
  
  const { 
    elementRef,
    isDragging,
    handleResizeStart,
    handleRotateStart,
    startDrag
  } = useAdvancedDraggable(element.id, {
    onDragStart: (el, x, y) => {
      if (frameRef.current && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        frameRef.current.style.transform = `translate(${rect.left}px, ${rect.top}px) rotate(${getRotation(element)}deg)`;
      }
    },
    onDragMove: (el, x, y) => {
      if (frameRef.current && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        frameRef.current.style.transform = `translate(${rect.left}px, ${rect.top}px) rotate(${getRotation(element)}deg)`;
      }
    },
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
  
  if ((element.isHidden || element.inInventory) && !isActive) {
    return null;
  }
  
  const rotation = getRotation(element);
  const elementStyle = getElementStyle(element, isDragging);
  
  return (
    <>
      <div 
        ref={frameRef} 
        className="element-frame absolute"
        style={{
          width: element.size?.width || 0,
          height: element.size?.height || 0,
          transform: `translate(${element.position.x}px, ${element.position.y}px) rotate(${rotation}deg)`,
          transformOrigin: '0 0',
          border: isActive ? '1px solid #6366F1' : 'none',
          pointerEvents: 'none',
          zIndex: 1000 + element.layer,
        }}
      />
      
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
          frameTransform={`rotate(${rotation}deg)`}
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
