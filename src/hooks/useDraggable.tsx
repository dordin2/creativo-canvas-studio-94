
import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements, draggedInventoryItem, handleItemCombination, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef<Position | null>(null);
  const elementInitialPos = useRef<Position | null>(null);
  const isDragStarted = useRef<boolean>(false);
  const rafId = useRef<number | null>(null);

  const currentElement = elements.find(el => el.id === elementId);
  
  const isPuzzleElement = currentElement?.type === 'puzzle';
  const isSequencePuzzleElement = currentElement?.type === 'sequencePuzzle';
  const isSliderPuzzleElement = currentElement?.type === 'sliderPuzzle';
  const isImageElement = currentElement?.type === 'image';

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

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

  const updateElementPosition = (clientX: number, clientY: number) => {
    if (!isDragging || !startPosition.current || !elementInitialPos.current) return;

    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      return;
    }

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const deltaX = clientX - startPosition.current!.x;
      const deltaY = clientY - startPosition.current!.y;

      const newX = Math.round(elementInitialPos.current!.x + deltaX);
      const newY = Math.round(elementInitialPos.current!.y + deltaY);

      updateElementWithoutHistory(elementId, {
        position: { x: newX, y: newY },
        style: {
          ...currentElement?.style,
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0)`,
          willChange: 'transform',
          cursor: 'grabbing',
          zIndex: 9999,
        }
      });
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    updateElementPosition(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    if (isDragStarted.current) {
      if (currentElement) {
        updateElementWithoutHistory(elementId, {
          style: {
            ...currentElement.style,
            transform: 'none',
            willChange: 'auto',
            cursor: 'grab',
          }
        });
      }
      commitToHistory();
    }

    setIsDragging(false);
    isDragStarted.current = false;
    startPosition.current = null;
    elementInitialPos.current = null;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent, initialPosition: Position) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    setIsDragging(true);

    if ('touches' in e) {
      const touch = e.touches[0];
      startPosition.current = { x: touch.clientX, y: touch.clientY };
      
      // Add touch event listeners
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      startPosition.current = { x: e.clientX, y: e.clientY };
    }

    elementInitialPos.current = initialPosition;
    isDragStarted.current = false;

    if (currentElement) {
      updateElementWithoutHistory(elementId, {
        style: {
          ...currentElement.style,
          willChange: 'transform',
          cursor: 'grabbing',
        }
      });
    }
  };

  return { startDrag, isDragging, currentElement };
};
