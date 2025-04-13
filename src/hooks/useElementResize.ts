
import { useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";

export const useElementResize = (element: DesignElement) => {
  const { updateElement } = useDesignState();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number | null>(null);

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    
    const width = element.size?.width || 100;
    const height = element.size?.height || 100;
    
    setStartSize({
      width: Math.round(width),
      height: Math.round(height)
    });
    
    setStartPosition({
      x: Math.round(element.position.x),
      y: Math.round(element.position.y)
    });
    
    if (element.type === 'image') {
      setOriginalAspectRatio(width / height);
    } else {
      setOriginalAspectRatio(null);
    }
  };

  const updateElementSize = (newWidth: number, newHeight: number, newX: number, newY: number) => {
    // Round values to eliminate sub-pixel rendering issues that cause jumping
    updateElement(element.id, {
      size: { 
        width: Math.round(newWidth), 
        height: Math.round(newHeight) 
      },
      position: { 
        x: Math.round(newX), 
        y: Math.round(newY) 
      }
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeDirection) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        
        const isImage = element.type === 'image';
        const maintainAspectRatio = isImage || originalAspectRatio !== null;
        
        let newWidth = startSize.width;
        let newHeight = startSize.height;
        let newX = startPosition.x;
        let newY = startPosition.y;
        
        // Calculate new dimensions and position based on resize direction
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(20, startSize.width + deltaX);
        }
        
        if (resizeDirection.includes('w')) {
          const widthChange = deltaX;
          newWidth = Math.max(20, startSize.width - widthChange);
          newX = startPosition.x + (startSize.width - newWidth);
        }
        
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(20, startSize.height + deltaY);
        }
        
        if (resizeDirection.includes('n')) {
          const heightChange = deltaY;
          newHeight = Math.max(20, startSize.height - heightChange);
          newY = startPosition.y + (startSize.height - newHeight);
        }
        
        // Handle aspect ratio preservation for images and other elements that need it
        if (maintainAspectRatio && originalAspectRatio) {
          if (resizeDirection === 'nw') {
            // For northwest corner, adjust both width and height proportionally
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width is driving dimension
              newWidth = Math.max(20, startSize.width - deltaX);
              newHeight = newWidth / originalAspectRatio;
              newX = startPosition.x + (startSize.width - newWidth);
              newY = startPosition.y + (startSize.height - newHeight);
            } else {
              // Height is driving dimension
              newHeight = Math.max(20, startSize.height - deltaY);
              newWidth = newHeight * originalAspectRatio;
              newX = startPosition.x + (startSize.width - newWidth);
              newY = startPosition.y + (startSize.height - newHeight);
            }
          } else if (resizeDirection === 'ne') {
            // For northeast corner
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width is driving dimension
              newWidth = Math.max(20, startSize.width + deltaX);
              newHeight = newWidth / originalAspectRatio;
              newY = startPosition.y + (startSize.height - newHeight);
            } else {
              // Height is driving dimension
              newHeight = Math.max(20, startSize.height - deltaY);
              newWidth = newHeight * originalAspectRatio;
              newY = startPosition.y + (startSize.height - newHeight);
            }
          } else if (resizeDirection === 'sw') {
            // For southwest corner
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width is driving dimension
              newWidth = Math.max(20, startSize.width - deltaX);
              newHeight = newWidth / originalAspectRatio;
              newX = startPosition.x + (startSize.width - newWidth);
            } else {
              // Height is driving dimension
              newHeight = Math.max(20, startSize.height + deltaY);
              newWidth = newHeight * originalAspectRatio;
              newX = startPosition.x + (startSize.width - newWidth);
            }
          } else if (resizeDirection === 'se') {
            // For southeast corner
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Width is driving dimension
              newWidth = Math.max(20, startSize.width + deltaX);
              newHeight = newWidth / originalAspectRatio;
            } else {
              // Height is driving dimension
              newHeight = Math.max(20, startSize.height + deltaY);
              newWidth = newHeight * originalAspectRatio;
            }
          } else if (resizeDirection === 'n' || resizeDirection === 's') {
            // For north or south sides, adjust width based on height
            newWidth = newHeight * originalAspectRatio;
            if (resizeDirection === 'n') {
              newY = startPosition.y + (startSize.height - newHeight);
            }
          } else if (resizeDirection === 'e' || resizeDirection === 'w') {
            // For east or west sides, adjust height based on width
            newHeight = newWidth / originalAspectRatio;
            if (resizeDirection === 'w') {
              newX = startPosition.x + (startSize.width - newWidth);
            }
          }
        }
        
        // Update element with both new size and position in a single update
        updateElementSize(newWidth, newHeight, newX, newY);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizing,
    startPos, 
    startSize,
    startPosition,
    resizeDirection, 
    element, 
    updateElement,
    originalAspectRatio
  ]);

  return {
    isResizing,
    handleResizeStart
  };
};
