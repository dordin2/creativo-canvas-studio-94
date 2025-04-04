
import { useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";

export const useElementResize = (element: DesignElement) => {
  const { updateElement } = useDesignState();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
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
    
    if (element.type === 'image') {
      setOriginalAspectRatio(width / height);
    } else {
      setOriginalAspectRatio(null);
    }
  };

  const updateElementSize = (newWidth: number, newHeight: number) => {
    updateElement(element.id, {
      size: { width: newWidth, height: newHeight }
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
        let newX = element.position.x;
        let newY = element.position.y;
        
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(20, startSize.width + deltaX);
        }
        
        if (resizeDirection.includes('w')) {
          const widthChange = deltaX;
          newWidth = Math.max(20, startSize.width - widthChange);
          newX = element.position.x + (startSize.width - newWidth);
        }
        
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(20, startSize.height + deltaY);
        }
        
        if (resizeDirection.includes('n')) {
          const heightChange = deltaY;
          newHeight = Math.max(20, startSize.height - heightChange);
          newY = element.position.y + (startSize.height - newHeight);
        }
        
        if (maintainAspectRatio && originalAspectRatio) {
          if (resizeDirection.includes('e') || resizeDirection.includes('w')) {
            newHeight = newWidth / originalAspectRatio;
            if (resizeDirection.includes('n')) {
              newY = element.position.y + (startSize.height - newHeight);
            }
          } else {
            newWidth = newHeight * originalAspectRatio;
            if (resizeDirection.includes('w')) {
              newX = element.position.x + (startSize.width - newWidth);
            }
          }
        }
        
        updateElement(element.id, {
          position: { x: newX, y: newY }
        });
        
        updateElementSize(newWidth, newHeight);
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
