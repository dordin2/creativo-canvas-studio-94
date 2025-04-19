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

  // Improved vector-based resize calculation with proper anchor points
  // This matches Canva's resize behavior more closely
  const calculateResizeVector = (
    deltaX: number,
    deltaY: number,
    direction: string,
    maintainAspectRatio: boolean
  ) => {
    // Initialize with start values
    let newWidth = startSize.width;
    let newHeight = startSize.height;
    let newX = startPosition.x;
    let newY = startPosition.y;
    
    // For aspect ratio preservation, calculate based on anchor point
    if (maintainAspectRatio && originalAspectRatio) {
      // Define anchor point based on resize direction
      let anchorX = startPosition.x;
      let anchorY = startPosition.y;
      
      if (direction.includes('e')) {
        // East anchor is the west edge
        // Keep left edge fixed
      } else if (direction.includes('w')) {
        // West anchor is the east edge
        anchorX = startPosition.x + startSize.width;
      }
      
      if (direction.includes('s')) {
        // South anchor is the north edge
        // Keep top edge fixed
      } else if (direction.includes('n')) {
        // North anchor is the south edge
        anchorY = startPosition.y + startSize.height;
      }
      
      // Determine scaling based on direction and deltas
      let scaleFactor = 1;
      
      if (direction === 'e' || direction === 'w') {
        // Horizontal resize only
        scaleFactor = Math.max(0.1, (startSize.width + (direction === 'e' ? deltaX : -deltaX)) / startSize.width);
        newWidth = startSize.width * scaleFactor;
        newHeight = newWidth / originalAspectRatio;
      } else if (direction === 'n' || direction === 's') {
        // Vertical resize only
        scaleFactor = Math.max(0.1, (startSize.height + (direction === 's' ? deltaY : -deltaY)) / startSize.height);
        newHeight = startSize.height * scaleFactor;
        newWidth = newHeight * originalAspectRatio;
      } else {
        // Corner resize - use the larger delta for more consistent scaling
        const horizontalScale = Math.max(0.1, (startSize.width + (direction.includes('e') ? deltaX : -deltaX)) / startSize.width);
        const verticalScale = Math.max(0.1, (startSize.height + (direction.includes('s') ? deltaY : -deltaY)) / startSize.height);
        
        // Use the larger delta for smoother scaling, weighted by mouse movement direction
        const weightX = Math.abs(deltaX) / (Math.abs(deltaX) + Math.abs(deltaY) + 0.001);
        const weightY = Math.abs(deltaY) / (Math.abs(deltaX) + Math.abs(deltaY) + 0.001);
        
        if (weightX > weightY) {
          scaleFactor = horizontalScale;
        } else {
          scaleFactor = verticalScale;
        }
        
        newWidth = startSize.width * scaleFactor;
        newHeight = newWidth / originalAspectRatio;
      }
      
      // Calculate new position based on anchor point
      if (direction.includes('w')) {
        newX = anchorX - newWidth;
      }
      if (direction.includes('n')) {
        newY = anchorY - newHeight;
      }
    } else {
      // Non-aspect ratio resize - direct manipulation
      if (direction.includes('e')) {
        newWidth = Math.max(20, startSize.width + deltaX);
      } else if (direction.includes('w')) {
        newWidth = Math.max(20, startSize.width - deltaX);
        newX = startPosition.x + (startSize.width - newWidth);
      }
      
      if (direction.includes('s')) {
        newHeight = Math.max(20, startSize.height + deltaY);
      } else if (direction.includes('n')) {
        newHeight = Math.max(20, startSize.height - deltaY);
        newY = startPosition.y + (startSize.height - newHeight);
      }
    }
    
    // Ensure minimum size
    newWidth = Math.max(20, newWidth);
    newHeight = Math.max(20, newHeight);
    
    return { newWidth, newHeight, newX, newY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeDirection) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        
        const isImage = element.type === 'image';
        const maintainAspectRatio = isImage || originalAspectRatio !== null;
        
        // Use the improved anchor-based resize calculation
        const { newWidth, newHeight, newX, newY } = calculateResizeVector(
          deltaX, 
          deltaY, 
          resizeDirection, 
          maintainAspectRatio
        );
        
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
