
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
        
        // Common scaling functions for consistent behavior
        const scaleWidth = (widthChange: number) => {
          const tempWidth = Math.max(20, startSize.width + widthChange);
          if (maintainAspectRatio && originalAspectRatio) {
            return {
              width: tempWidth,
              height: tempWidth / originalAspectRatio
            };
          }
          return { width: tempWidth, height: newHeight };
        };
        
        const scaleHeight = (heightChange: number) => {
          const tempHeight = Math.max(20, startSize.height + heightChange);
          if (maintainAspectRatio && originalAspectRatio) {
            return {
              width: tempHeight * originalAspectRatio,
              height: tempHeight
            };
          }
          return { width: newWidth, height: tempHeight };
        };
        
        // Process resize based on direction with consistent math for all handles
        if (resizeDirection === 'e') {
          // East - right edge
          const scaled = scaleWidth(deltaX);
          newWidth = scaled.width;
          newHeight = scaled.height;
        } 
        else if (resizeDirection === 'w') {
          // West - left edge
          const scaled = scaleWidth(-deltaX);
          newWidth = scaled.width;
          newHeight = scaled.height;
          newX = startPosition.x + (startSize.width - newWidth);
        } 
        else if (resizeDirection === 's') {
          // South - bottom edge
          const scaled = scaleHeight(deltaY);
          newWidth = scaled.width;
          newHeight = scaled.height;
        } 
        else if (resizeDirection === 'n') {
          // North - top edge
          const scaled = scaleHeight(-deltaY);
          newWidth = scaled.width;
          newHeight = scaled.height;
          newY = startPosition.y + (startSize.height - newHeight);
        } 
        else if (resizeDirection === 'ne') {
          // Northeast - top right corner
          // Choose the dominant dimension for consistent behavior
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const scaled = scaleWidth(deltaX);
            newWidth = scaled.width;
            newHeight = scaled.height;
            newY = startPosition.y + (startSize.height - newHeight);
          } else {
            const scaled = scaleHeight(-deltaY);
            newWidth = scaled.width;
            newHeight = scaled.height;
            newY = startPosition.y + (startSize.height - newHeight);
          }
        } 
        else if (resizeDirection === 'nw') {
          // Northwest - top left corner
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const scaled = scaleWidth(-deltaX);
            newWidth = scaled.width;
            newHeight = scaled.height;
            newX = startPosition.x + (startSize.width - newWidth);
            newY = startPosition.y + (startSize.height - newHeight);
          } else {
            const scaled = scaleHeight(-deltaY);
            newWidth = scaled.width;
            newHeight = scaled.height;
            newX = startPosition.x + (startSize.width - newWidth);
            newY = startPosition.y + (startSize.height - newHeight);
          }
        } 
        else if (resizeDirection === 'se') {
          // Southeast - bottom right corner
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const scaled = scaleWidth(deltaX);
            newWidth = scaled.width;
            newHeight = scaled.height;
          } else {
            const scaled = scaleHeight(deltaY);
            newWidth = scaled.width;
            newHeight = scaled.height;
          }
        } 
        else if (resizeDirection === 'sw') {
          // Southwest - bottom left corner
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const scaled = scaleWidth(-deltaX);
            newWidth = scaled.width;
            newHeight = scaled.height;
            newX = startPosition.x + (startSize.width - newWidth);
          } else {
            const scaled = scaleHeight(deltaY);
            newWidth = scaled.width;
            newHeight = scaled.height;
            newX = startPosition.x + (startSize.width - newWidth);
          }
        }
        
        // Ensure all values are properly rounded for visual stability
        newWidth = Math.round(newWidth);
        newHeight = Math.round(newHeight);
        newX = Math.round(newX);
        newY = Math.round(newY);
        
        // Apply the changes
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
