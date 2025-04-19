import { useState, useEffect, useRef, useCallback } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string, canvasScale: number = 1) => {
  const { updateElementWithoutHistory, commitToHistory, elements, draggedInventoryItem, handleItemCombination, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosition = useRef<Position | null>(null);
  const elementStartPosition = useRef<Position | null>(null);
  const { isMobileDevice } = useMobile();
  const currentElement = elements.find(el => el.id === elementId);

  const toCanvasCoords = useCallback((clientX: number, clientY: number): Position => {
    if (!currentElement) return { x: 0, y: 0 };
    
    const canvas = document.querySelector('.canvas-container');
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / canvasScale,
      y: (clientY - rect.top) / canvasScale
    };
  }, [canvasScale, currentElement]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!dragStartPosition.current || !elementStartPosition.current) return;
      if (isGameMode && currentElement?.type === 'image' && !currentElement?.interaction?.type) return;

      const canvasCoords = toCanvasCoords(clientX, clientY);
      const dragStartCoords = toCanvasCoords(
        dragStartPosition.current.x,
        dragStartPosition.current.y
      );

      const newLeft = elementStartPosition.current.x + (canvasCoords.x - dragStartCoords.x);
      const newTop = elementStartPosition.current.y + (canvasCoords.y - dragStartCoords.y);

      requestAnimationFrame(() => {
        updateElementWithoutHistory(elementId, {
          position: {
            x: newLeft,
            y: newTop
          }
        });
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobileDevice) return;
      handleMove(e.clientX, e.clientY);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isMobileDevice) return;
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragStartPosition.current = null;
      elementStartPosition.current = null;
      commitToHistory();
    };

    if (isMobileDevice) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
    }

    return () => {
      if (isMobileDevice) {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
        document.removeEventListener('touchcancel', handleEnd);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
      }
    };
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory, currentElement, isGameMode, toCanvasCoords]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent, elementPosition?: Position) => {
    if (isGameMode && currentElement?.type === 'image' && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    setIsDragging(true);

    if ('touches' in e && isMobileDevice) {
      const touch = e.touches[0];
      dragStartPosition.current = { 
        x: touch.clientX, 
        y: touch.clientY 
      };
    } else if (!isMobileDevice) {
      const mouseEvent = e as React.MouseEvent;
      dragStartPosition.current = { 
        x: mouseEvent.clientX, 
        y: mouseEvent.clientY 
      };
    }

    if (currentElement) {
      elementStartPosition.current = elementPosition || { 
        x: currentElement.position.x, 
        y: currentElement.position.y 
      };
    }
  };

  useEffect(() => {
    const handleDragOver = (e: MouseEvent) => {
      if (draggedInventoryItem && currentElement.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
        const element = document.getElementById(`element-${elementId}`);
        if (element) {
          element.classList.add('drop-target');
        }
      }
    };
    
    const handleDragLeave = () => {
      const element = document.getElementById(`element-${elementId}`);
      if (element) {
        element.classList.remove('drop-target');
      }
    };
    
    const handleCustomDragOver = (e: CustomEvent) => {
      if (!draggedInventoryItem) return;
      
      const element = document.getElementById(`element-${elementId}`);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.detail.clientX;
      const y = e.detail.clientY;
      
      if (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom
      ) {
        if (currentElement.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
          element.classList.add('drop-target');
        }
      } else {
        element.classList.remove('drop-target');
      }
    };
    
    const handleCustomDrop = (e: CustomEvent) => {
      if (!draggedInventoryItem) return;
      
      const element = document.getElementById(`element-${elementId}`);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.detail.clientX;
      const y = e.detail.clientY;
      
      if (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom
      ) {
        if (currentElement.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
          handleItemCombination(draggedInventoryItem.id, elementId);
        }
      }
      
      element.classList.remove('drop-target');
    };
    
    document.addEventListener('custom-drag-over', handleCustomDragOver as EventListener);
    document.addEventListener('custom-drop', handleCustomDrop as EventListener);
    
    return () => {
      document.removeEventListener('custom-drag-over', handleCustomDragOver as EventListener);
      document.removeEventListener('custom-drop', handleCustomDrop as EventListener);
    };
  }, [currentElement, draggedInventoryItem, elementId, handleItemCombination]);

  return { startDrag, isDragging, currentElement };
};
