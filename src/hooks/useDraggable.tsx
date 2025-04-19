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
  const dragStartPosition = useRef<Position | null>(null);
  const elementStartPosition = useRef<Position | null>(null);
  const { isMobileDevice, isMobileView } = useMobile();
  const currentElement = elements.find(el => el.id === elementId);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const isPuzzleElement = currentElement?.type === 'puzzle';
  const isSequencePuzzleElement = currentElement?.type === 'sequencePuzzle';
  const isSliderPuzzleElement = currentElement?.type === 'sliderPuzzle';
  const isImageElement = currentElement?.type === 'image';

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!dragStartPosition.current || !elementStartPosition.current) return;
      if (isGameMode && isImageElement && !currentElement?.interaction?.type) return;

      const canvas = document.querySelector('.canvas-container');
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      const elementRect = elementRef.current?.getBoundingClientRect();
      
      if (!elementRect) return;

      let newLeft = elementStartPosition.current.x + (clientX - dragStartPosition.current.x);
      let newTop = elementStartPosition.current.y + (clientY - dragStartPosition.current.y);

      newLeft = Math.max(0, Math.min(newLeft, canvasRect.width - elementRect.width));
      newTop = Math.max(0, Math.min(newTop, canvasRect.height - elementRect.height));

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
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory, currentElement, isGameMode, isImageElement, isMobileDevice]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent, elementPosition?: Position) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
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

  return { startDrag, isDragging, currentElement, elementRef };
};
