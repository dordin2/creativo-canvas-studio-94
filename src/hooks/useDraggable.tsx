import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements, draggedInventoryItem, handleItemCombination, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const { isMobileDevice, isMobileView } = useMobile();
  const currentElement = elements.find(el => el.id === elementId);
  
  const isPuzzleElement = currentElement?.type === 'puzzle';
  const isSequencePuzzleElement = currentElement?.type === 'sequencePuzzle';
  const isSliderPuzzleElement = currentElement?.type === 'sliderPuzzle';
  const isImageElement = currentElement?.type === 'image';

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!currentElement) return;
      if (isGameMode && isImageElement && !currentElement?.interaction?.type) return;

      const newLeft = clientX - dragOffset.current.x;
      const newTop = clientY - dragOffset.current.y;

      updateElementWithoutHistory(elementId, {
        position: {
          x: newLeft,
          y: newTop
        }
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
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory, currentElement, isGameMode, isImageElement, isMobileDevice]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent, elementPosition: Position) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    setIsDragging(true);

    const element = document.getElementById(`element-${elementId}`);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    
    if ('touches' in e && isMobileDevice) {
      const touch = e.touches[0];
      dragOffset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else if (!isMobileDevice) {
      const mouseEvent = e as React.MouseEvent;
      dragOffset.current = {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
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
