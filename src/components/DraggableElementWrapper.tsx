
import { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { useAdvancedDraggable } from "@/hooks/useAdvancedDraggable";
import { getElementStyle, getRotation } from "@/utils/elementStyles";
import DraggableElement from "./DraggableElement";
import ResizeHandles from "./element/ResizeHandles";

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
  const { elementRef, handleResizeStart } = useAdvancedDraggable(element.id);
  
  if (element.isHidden || element.inInventory) {
    return null;
  }
  
  const rotation = getRotation(element);
  const elementStyle = getElementStyle(element, false);
  
  return (
    <>
      <div 
        ref={elementRef}
        className="canvas-element"
        style={elementStyle}
      >
        {children}
        {isActive && element.type === 'image' && (
          <ResizeHandles
            show={true}
            onResizeStart={handleResizeStart}
          />
        )}
      </div>
    </>
  );
};

export default DraggableElementWrapper;
