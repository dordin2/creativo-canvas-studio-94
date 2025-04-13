import { useState, useEffect, useRef } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { useIsMobile } from "@/hooks/use-mobile";

export const useElementResize = (element: DesignElement) => {
  const { updateElement } = useDesignState();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number | null>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const isMobile = useIsMobile();

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, direction: string) => {
    if ('stopPropagation' in e) e.stopPropagation();
    if ('preventDefault' in e) e.preventDefault();
    
    setIsResizing(true);
    setResizeDirection(direction);
    
    // Handle mouse events
    if ('clientX' in e) {
      setStartPos({ x: e.clientX, y: e.clientY });
    } 
    // Handle touch events
    else if ('touches' in e && e.touches.length === 1) {
      const touch = e.touches[0];
      setStartPos({ x: touch.clientX, y: touch.clientY });
    }
    
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

  const handlePinchToZoom = (e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    if (lastTouchDistance.current === null) {
      lastTouchDistance.current = distance;
      return;
    }
    
    const scaleFactor = distance / lastTouchDistance.current;
    lastTouchDistance.current = distance;
    
    let newWidth = element.size?.width || 100;
    let newHeight = element.size?.height || 100;
    
    newWidth = Math.max(20, Math.round(newWidth * scaleFactor));
    
    if (element.type === 'image' || originalAspectRatio) {
      const aspectRatio = originalAspectRatio || (element.size?.width || 100) / (element.size?.height || 100);
      newHeight = Math.round(newWidth / aspectRatio);
    } else {
      newHeight = Math.max(20, Math.round(newHeight * scaleFactor));
    }
    
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    
    const elementCenterX = element.position.x + (element.size?.width || 100) / 2;
    const elementCenterY = element.position.y + (element.size?.height || 100) / 2;
    
    const newX = element.position.x - (newWidth - (element.size?.width || 100)) / 2;
    const newY = element.position.y - (newHeight - (element.size?.height || 100)) / 2;
    
    updateElement(element.id, {
      size: { width: newWidth, height: newHeight },
      position: { x: Math.round(newX), y: Math.round(newY) }
    });
  };

  const updateElementSize = (newWidth: number, newHeight: number, newX: number, newY: number) => {
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
        
        if (maintainAspectRatio && originalAspectRatio) {
          if (resizeDirection === 'nw' || resizeDirection === 'ne' || 
              resizeDirection === 'sw' || resizeDirection === 'se') {
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
          } else if (resizeDirection === 'n' || resizeDirection === 's') {
            newWidth = newHeight * originalAspectRatio;
            if (resizeDirection === 'n') {
              newY = startPosition.y + (startSize.height - newHeight);
            }
          } else if (resizeDirection === 'e' || resizeDirection === 'w') {
            newHeight = newWidth / originalAspectRatio;
            if (resizeDirection === 'w') {
              newX = startPosition.x + (startSize.width - newWidth);
            }
          }
        }
        
        updateElementSize(newWidth, newHeight, newX, newY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing) return;
      
      if (e.touches.length === 2) {
        e.preventDefault();
        handlePinchToZoom(e);
        return;
      }
      
      if (resizeDirection && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - startPos.x;
        const deltaY = touch.clientY - startPos.y;
        
        const isImage = element.type === 'image';
        const maintainAspectRatio = isImage || originalAspectRatio !== null;
        
        let newWidth = startSize.width;
        let newHeight = startSize.height;
        let newX = startPosition.x;
        let newY = startPosition.y;
        
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
        
        if (maintainAspectRatio && originalAspectRatio) {
          if (resizeDirection === 'nw' || resizeDirection === 'ne' || 
              resizeDirection === 'sw' || resizeDirection === 'se') {
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
          } else if (resizeDirection === 'n' || resizeDirection === 's') {
            newWidth = newHeight * originalAspectRatio;
            if (resizeDirection === 'n') {
              newY = startPosition.y + (startSize.height - newHeight);
            }
          } else if (resizeDirection === 'e' || resizeDirection === 'w') {
            newHeight = newWidth / originalAspectRatio;
            if (resizeDirection === 'w') {
              newX = startPosition.x + (startSize.width - newWidth);
            }
          }
        }
        
        updateElementSize(newWidth, newHeight, newX, newY);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      lastTouchDistance.current = null;
    };
    
    const handleTouchEnd = () => {
      setIsResizing(false);
      setResizeDirection(null);
      lastTouchDistance.current = null;
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("touchcancel", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
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
