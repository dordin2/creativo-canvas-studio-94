
import React from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import ResizeHandles from "./ResizeHandles";
import RotationHandle from "./RotationHandle";

interface ElementControlsProps {
  isActive: boolean;
  element: DesignElement;
  frameTransform: string;
  onResizeStart: (e: React.MouseEvent, direction: string) => void;
  onRotateStart: (e: React.MouseEvent) => void;
  showControls: boolean;
  isMultiSelection?: boolean;
}

const ElementControls: React.FC<ElementControlsProps> = ({
  isActive,
  element,
  frameTransform,
  onResizeStart,
  onRotateStart,
  showControls,
  isMultiSelection = false
}) => {
  const { updateMultipleElements, selectedElementIds } = useDesignState();

  if (!isActive || !showControls) {
    return null;
  }

  const handleMultiResize = (e: React.MouseEvent, direction: string) => {
    if (isMultiSelection) {
      // For multi-selection, we'll handle resizing in a special way
      e.stopPropagation();
      e.preventDefault();
      
      // Calculate initial dimensions for each element
      const initialDimensions = new Map();
      selectedElementIds.forEach(id => {
        const el = document.querySelector(`[data-element-id="${id}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          initialDimensions.set(id, {
            width: rect.width,
            height: rect.height
          });
        }
      });
      
      // Remember the initial mouse position
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      
      // Function to handle resize during mouse move
      const handleMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();
        
        const deltaX = moveEvent.clientX - startMouseX;
        const deltaY = moveEvent.clientY - startMouseY;
        
        // Calculate the scaling factors for width and height
        let scaleX = 1, scaleY = 1;
        
        if (direction.includes('e')) {
          scaleX = 1 + (deltaX / (element.size?.width || 100));
        } else if (direction.includes('w')) {
          scaleX = 1 - (deltaX / (element.size?.width || 100));
        }
        
        if (direction.includes('s')) {
          scaleY = 1 + (deltaY / (element.size?.height || 100));
        } else if (direction.includes('n')) {
          scaleY = 1 - (deltaY / (element.size?.height || 100));
        }
        
        // Apply scaling to all selected elements
        const scaledElements = selectedElementIds.map(id => {
          const initialSize = initialDimensions.get(id);
          if (!initialSize) return null;
          
          return {
            id,
            size: {
              width: Math.max(20, Math.round(initialSize.width * scaleX)),
              height: Math.max(20, Math.round(initialSize.height * scaleY))
            }
          };
        }).filter(Boolean);
        
        // Update elements
        scaledElements.forEach(el => {
          if (el) {
            updateMultipleElements(selectedElementIds, (elem) => ({
              size: {
                width: Math.max(20, Math.round((elem.size?.width || 100) * scaleX)),
                height: Math.max(20, Math.round((elem.size?.height || 100) * scaleY))
              }
            }));
          }
        });
      };
      
      // Function to clean up event listeners
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      // Add event listeners for dragging
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      // For single element, use the provided resize handler
      onResizeStart(e, direction);
    }
  };

  const handleMultiRotate = (e: React.MouseEvent) => {
    if (isMultiSelection) {
      // For multi-selection rotation
      e.stopPropagation();
      e.preventDefault();
      
      // Find the center point of all selected elements
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      selectedElementIds.forEach(id => {
        const el = document.querySelector(`[data-element-id="${id}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          minX = Math.min(minX, rect.left);
          minY = Math.min(minY, rect.top);
          maxX = Math.max(maxX, rect.right);
          maxY = Math.max(maxY, rect.bottom);
        }
      });
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      // Get initial angles for each element
      const initialAngles = new Map();
      selectedElementIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          // Extract current rotation angle
          const transform = window.getComputedStyle(el).transform;
          let angle = 0;
          if (transform && transform !== 'none') {
            const matrix = transform.match(/^matrix\((.+)\)$/);
            if (matrix) {
              const values = matrix[1].split(',');
              angle = Math.round(Math.atan2(parseFloat(values[1]), parseFloat(values[0])) * (180/Math.PI));
            }
          }
          initialAngles.set(id, angle);
        }
      });
      
      // Calculate initial angle to mouse position
      const initialMouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180/Math.PI);
      
      // Handle mouse movement for rotation
      const handleMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();
        
        // Calculate current angle
        const currentMouseAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180/Math.PI);
        const angleDelta = currentMouseAngle - initialMouseAngle;
        
        // Update all elements with new rotation
        updateMultipleElements(selectedElementIds, (elem) => {
          // Get initial transform or use default
          const initialTransform = elem.style?.transform || 'rotate(0deg)';
          const initialAngle = initialTransform.match(/rotate\(([^)]+)deg\)/) 
            ? parseInt(initialTransform.match(/rotate\(([^)]+)deg\)/)![1], 10) 
            : 0;
          
          // Calculate new angle
          const newAngle = initialAngle + angleDelta;
          
          return {
            style: {
              ...elem.style,
              transform: `rotate(${Math.round(newAngle)}deg)`
            }
          };
        });
      };
      
      // Clean up function
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      // Add event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      // For single element rotation
      onRotateStart(e);
    }
  };

  return (
    <div
      className="element-controls"
      style={{
        position: "absolute",
        top: `${element.position.y}px`,
        left: `${element.position.x}px`,
        width: `${element.size?.width || 100}px`,
        height: `${element.size?.height || 100}px`,
        transform: frameTransform,
        pointerEvents: "none",
        boxSizing: "border-box",
      }}
      data-element-id={element.id}
    >
      <ResizeHandles onResizeStart={isMultiSelection ? handleMultiResize : onResizeStart} />
      <RotationHandle onRotateStart={isMultiSelection ? handleMultiRotate : onRotateStart} />
    </div>
  );
};

export default ElementControls;
