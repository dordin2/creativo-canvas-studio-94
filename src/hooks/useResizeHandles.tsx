
import { useState, useCallback } from 'react';
import { DesignElement } from '@/types/designTypes';
import { useDesignState } from '@/context/DesignContext';

export const useResizeHandles = (element: DesignElement) => {
  const { updateElementWithoutHistory, commitToHistory } = useDesignState();
  const [isResizing, setIsResizing] = useState(false);
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent, direction: string) => {
    e.stopPropagation();
    if (!element.size) return;
    
    setIsResizing(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setStartPoint({ x: clientX, y: clientY });
    setStartSize({ width: element.size.width, height: element.size.height });
    setStartPosition({ x: element.position.x, y: element.position.y });
  }, [element]);

  const handleResize = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizing || !element.size) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startPoint.x;
    const deltaY = clientY - startPoint.y;
    
    const newWidth = Math.max(startSize.width + deltaX, 20);
    const newHeight = Math.max(startSize.height + deltaY, 20);
    
    updateElementWithoutHistory(element.id, {
      size: {
        width: newWidth,
        height: newHeight
      }
    });
  }, [isResizing, element, startPoint, startSize, updateElementWithoutHistory]);

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      commitToHistory();
    }
  }, [isResizing, commitToHistory]);

  return {
    isResizing,
    handleResizeStart,
    handleResize,
    handleResizeEnd
  };
};
