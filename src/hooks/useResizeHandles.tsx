
import { useState, useCallback } from 'react';
import { DesignElement } from '@/types/designTypes';
import { useDesignState } from '@/context/DesignContext';

export const useResizeHandles = (element: DesignElement) => {
  const { updateElementWithoutHistory, commitToHistory } = useDesignState();
  const [isResizing, setIsResizing] = useState(false);
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<string>('');

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent, resizeDirection: string) => {
    e.stopPropagation();
    if (!element.size) return;
    
    setIsResizing(true);
    setDirection(resizeDirection);
    
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

    let newWidth = startSize.width;
    let newHeight = startSize.height;
    let newX = element.position.x;
    let newY = element.position.y;

    const calculateNewDimensions = () => {
      switch (direction) {
        case 'e':
          newWidth = Math.max(startSize.width + deltaX, 20);
          break;
        case 'w':
          newWidth = Math.max(startSize.width - deltaX, 20);
          newX = startPosition.x + (startSize.width - newWidth);
          break;
        case 's':
          newHeight = Math.max(startSize.height + deltaY, 20);
          break;
        case 'n':
          newHeight = Math.max(startSize.height - deltaY, 20);
          newY = startPosition.y + (startSize.height - newHeight);
          break;
        case 'se':
          newWidth = Math.max(startSize.width + deltaX, 20);
          newHeight = Math.max(startSize.height + deltaY, 20);
          break;
        case 'sw':
          newWidth = Math.max(startSize.width - deltaX, 20);
          newHeight = Math.max(startSize.height + deltaY, 20);
          newX = startPosition.x + (startSize.width - newWidth);
          break;
        case 'ne':
          newWidth = Math.max(startSize.width + deltaX, 20);
          newHeight = Math.max(startSize.height - deltaY, 20);
          newY = startPosition.y + (startSize.height - newHeight);
          break;
        case 'nw':
          newWidth = Math.max(startSize.width - deltaX, 20);
          newHeight = Math.max(startSize.height - deltaY, 20);
          newX = startPosition.x + (startSize.width - newWidth);
          newY = startPosition.y + (startSize.height - newHeight);
          break;
      }
    };

    calculateNewDimensions();

    updateElementWithoutHistory(element.id, {
      position: { x: newX, y: newY },
      size: { width: newWidth, height: newHeight }
    });
  }, [isResizing, direction, element, startPoint, startSize, startPosition, updateElementWithoutHistory]);

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setDirection('');
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
