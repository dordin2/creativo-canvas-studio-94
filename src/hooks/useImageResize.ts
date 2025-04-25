
import { useState, useCallback } from 'react';
import { DesignElement } from '@/types/designTypes';
import { useDesignState } from '@/context/DesignContext';

export const useImageResize = (element: DesignElement) => {
  const { updateElement, updateElementWithoutHistory, commitToHistory } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const [tempScale, setTempScale] = useState(100);
  
  const calculateNewDimensions = (scale: number) => {
    if (!element.originalSize) return null;
    
    const scaleFactor = scale / 100;
    return {
      width: Math.round(element.originalSize.width * scaleFactor),
      height: Math.round(element.originalSize.height * scaleFactor)
    };
  };

  const handleResizeStart = () => {
    setIsDragging(true);
    if (element.size && element.originalSize) {
      const currentScale = Math.round((element.size.width / element.originalSize.width) * 100);
      setTempScale(currentScale);
    }
  };

  const handleResize = useCallback((value: number[]) => {
    const scale = value[0];
    setTempScale(scale);
    
    const newDimensions = calculateNewDimensions(scale);
    if (!newDimensions) return;
    
    // During drag, only update the transform scale for smooth visual feedback
    updateElementWithoutHistory(element.id, {
      style: {
        ...element.style,
        transform: `scale(${scale / 100})`,
        transformOrigin: 'top left',
        willChange: 'transform'  // Hardware acceleration hint
      }
    });
  }, [element.id, element.style, updateElementWithoutHistory]);

  const handleResizeEnd = useCallback(() => {
    setIsDragging(false);
    
    const newDimensions = calculateNewDimensions(tempScale);
    if (!newDimensions) return;

    // On drag end, update the actual dimensions and reset transform
    updateElement(element.id, {
      size: newDimensions,
      style: {
        ...element.style,
        transform: element.style?.transform || 'none',
        willChange: 'auto'
      }
    });
    
    commitToHistory();
  }, [tempScale, element, updateElement, commitToHistory]);

  return {
    isDragging,
    currentScale: tempScale,
    handleResizeStart,
    handleResize,
    handleResizeEnd
  };
};
