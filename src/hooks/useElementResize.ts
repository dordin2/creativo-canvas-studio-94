
import { useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";

export const useElementResize = (element: DesignElement) => {
  const { updateElement } = useDesignState();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 }); // Track starting position
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
      width: width,
      height: height
    });
    
    // Store the starting position
    setStartPosition({
      x: element.position.x,
      y: element.position.y
    });
    
    if (element.type === 'image') {
      setOriginalAspectRatio(width / height);
    } else {
      setOriginalAspectRatio(null);
    }
  };

  const updateElementSize = (newWidth: number, newHeight: number, newX: number, newY: number) => {
    updateElement(element.id, {
      size: { width: newWidth, height: newHeight },
      position: { x: newX, y: newY }
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
        let newX = startPosition.x; // Use starting position instead of current position
        let newY = startPosition.y; // Use starting position instead of current position
        
        // Calculate new dimensions and position based on resize direction
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(20, startSize.width + deltaX);
        }
        
        if (resizeDirection.includes('w')) {
          const widthChange = deltaX;
          newWidth = Math.max(20, startSize.width - widthChange);
          newX = startPosition.x + widthChange;
        }
        
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(20, startSize.height + deltaY);
        }
        
        if (resizeDirection.includes('n')) {
          const heightChange = deltaY;
          newHeight = Math.max(20, startSize.height - heightChange);
          newY = startPosition.y + heightChange;
        }
        
        // Handle aspect ratio preservation for images and other elements that need it
        if (maintainAspectRatio && originalAspectRatio) {
          // Define which dimension drives the resize
          if (['e', 'w'].includes(resizeDirection)) {
            // Width is driving dimension
            newHeight = newWidth / originalAspectRatio;
            if (resizeDirection === 'w') {
              // Adjust y position for nw and sw
              if (resizeDirection.includes('n')) {
                newY = startPosition.y + (startSize.height - newHeight);
              }
            }
          } else if (['n', 's'].includes(resizeDirection)) {
            // Height is driving dimension
            newWidth = newHeight * originalAspectRatio;
            if (resizeDirection === 'n') {
              // Adjust x position for nw and ne
              if (resizeDirection.includes('w')) {
                newX = startPosition.x + (startSize.width - newWidth);
              }
            }
          } else if (resizeDirection === 'nw') {
            // For corner resizing, use the larger delta to determine the driving dimension
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newWidth = Math.max(20, startSize.width - deltaX);
              newHeight = newWidth / originalAspectRatio;
              newX = startPosition.x + (startSize.width - newWidth);
              newY = startPosition.y + (startSize.height - newHeight);
            } else {
              newHeight = Math.max(20, startSize.height - deltaY);
              newWidth = newHeight * originalAspectRatio;
              newX = startPosition.x + (startSize.width - newWidth);
              newY = startPosition.y + (startSize.height - newHeight);
            }
          } else if (resizeDirection === 'ne') {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newWidth = Math.max(20, startSize.width + deltaX);
              newHeight = newWidth / originalAspectRatio;
              newY = startPosition.y + (startSize.height - newHeight);
            } else {
              newHeight = Math.max(20, startSize.height - deltaY);
              newWidth = newHeight * originalAspectRatio;
              newY = startPosition.y + (startSize.height - newHeight);
            }
          } else if (resizeDirection === 'sw') {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newWidth = Math.max(20, startSize.width - deltaX);
              newHeight = newWidth / originalAspectRatio;
              newX = startPosition.x + (startSize.width - newWidth);
            } else {
              newHeight = Math.max(20, startSize.height + deltaY);
              newWidth = newHeight * originalAspectRatio;
              newX = startPosition.x + (startSize.width - newWidth);
            }
          } else if (resizeDirection === 'se') {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newWidth = Math.max(20, startSize.width + deltaX);
              newHeight = newWidth / originalAspectRatio;
            } else {
              newHeight = Math.max(20, startSize.height + deltaY);
              newWidth = newHeight * originalAspectRatio;
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
    startPosition, // Add startPosition to dependencies
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
