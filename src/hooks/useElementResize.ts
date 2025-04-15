
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

  // New helper function to resize with aspect ratio
  const resizeWithAspectRatio = (
    deltaX: number, 
    deltaY: number, 
    direction: string
  ) => {
    if (!originalAspectRatio) return null;
    
    // Calculate the new dimensions based on both deltas
    let newWidth = startSize.width;
    let newHeight = startSize.height;
    let newX = startPosition.x;
    let newY = startPosition.y;
    
    // Determine which delta would produce the larger change relative to original dimensions
    // This creates smoother transitions and prevents "jumps"
    const widthChange = Math.abs(deltaX / startSize.width);
    const heightChange = Math.abs(deltaY / startSize.height);
    
    // Apply the larger effect for consistent resizing
    if (widthChange >= heightChange) {
      // Width-driven resize
      if (direction.includes('e')) {
        // Right side
        newWidth = Math.max(20, startSize.width + deltaX);
        newHeight = newWidth / originalAspectRatio;
      } else if (direction.includes('w')) {
        // Left side
        newWidth = Math.max(20, startSize.width - deltaX);
        newX = startPosition.x + (startSize.width - newWidth);
        newHeight = newWidth / originalAspectRatio;
      }
    } else {
      // Height-driven resize
      if (direction.includes('s')) {
        // Bottom side
        newHeight = Math.max(20, startSize.height + deltaY);
        newWidth = newHeight * originalAspectRatio;
      } else if (direction.includes('n')) {
        // Top side
        newHeight = Math.max(20, startSize.height - deltaY);
        newY = startPosition.y + (startSize.height - newHeight);
        newWidth = newHeight * originalAspectRatio;
      }
    }
    
    // For corner resizing, ensure position is correctly adjusted
    if (direction === 'nw' || direction === 'ne' || direction === 'sw' || direction === 'se') {
      if (direction.includes('n')) {
        newY = startPosition.y + (startSize.height - newHeight);
      }
      if (direction.includes('w')) {
        newX = startPosition.x + (startSize.width - newWidth);
      }
    }
    
    return { newWidth, newHeight, newX, newY };
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
        
        // Corner resize handling with improved aspect ratio preservation
        if (resizeDirection.length === 2) {
          // Two-character direction means corner (ne, nw, se, sw)
          if (maintainAspectRatio && originalAspectRatio) {
            // Use our new helper function for consistent corner resizing
            const aspectResult = resizeWithAspectRatio(deltaX, deltaY, resizeDirection);
            if (aspectResult) {
              ({ newWidth, newHeight, newX, newY } = aspectResult);
            }
          } else {
            // Handle non-aspect ratio corners
            switch (resizeDirection) {
              case 'ne':
                newWidth = Math.max(20, startSize.width + deltaX);
                newHeight = Math.max(20, startSize.height - deltaY);
                newY = startPosition.y + (startSize.height - newHeight);
                break;
              case 'nw':
                newWidth = Math.max(20, startSize.width - deltaX);
                newHeight = Math.max(20, startSize.height - deltaY);
                newX = startPosition.x + (startSize.width - newWidth);
                newY = startPosition.y + (startSize.height - newHeight);
                break;
              case 'se':
                newWidth = Math.max(20, startSize.width + deltaX);
                newHeight = Math.max(20, startSize.height + deltaY);
                break;
              case 'sw':
                newWidth = Math.max(20, startSize.width - deltaX);
                newHeight = Math.max(20, startSize.height + deltaY);
                newX = startPosition.x + (startSize.width - newWidth);
                break;
            }
          }
        } 
        // Edge resize handling
        else {
          switch (resizeDirection) {
            case 'e':
              // East - right edge
              newWidth = Math.max(20, startSize.width + deltaX);
              if (maintainAspectRatio && originalAspectRatio) {
                newHeight = newWidth / originalAspectRatio;
              }
              break;
            case 'w':
              // West - left edge
              newWidth = Math.max(20, startSize.width - deltaX);
              newX = startPosition.x + (startSize.width - newWidth);
              if (maintainAspectRatio && originalAspectRatio) {
                newHeight = newWidth / originalAspectRatio;
              }
              break;
            case 's':
              // South - bottom edge
              newHeight = Math.max(20, startSize.height + deltaY);
              if (maintainAspectRatio && originalAspectRatio) {
                newWidth = newHeight * originalAspectRatio;
              }
              break;
            case 'n':
              // North - top edge
              newHeight = Math.max(20, startSize.height - deltaY);
              newY = startPosition.y + (startSize.height - newHeight);
              if (maintainAspectRatio && originalAspectRatio) {
                newWidth = newHeight * originalAspectRatio;
              }
              break;
          }
        }
        
        // Apply the changes with consistent rounding
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
