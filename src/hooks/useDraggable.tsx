import { useState, useEffect, useRef, useCallback } from 'react';
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
  const animationFrame = useRef<number | null>(null);
  const touchPosition = useRef<Position>({ x: 0, y: 0 });
  const mousePosition = useRef<Position>({ x: 0, y: 0 });
  const lastUpdateTimestamp = useRef<number>(0);

  const currentElement = elements.find(el => el.id === elementId);
  
  const isPuzzleElement = currentElement?.type === 'puzzle';
  const isSequencePuzzleElement = currentElement?.type === 'sequencePuzzle';
  const isSliderPuzzleElement = currentElement?.type === 'sliderPuzzle';
  const isImageElement = currentElement?.type === 'image';

  useEffect(() => {
    if (!currentElement) return;
    
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

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || !startPosition.current || !elementInitialPos.current) return;

      if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
        return;
      }

      const now = Date.now();
      if (now - lastUpdateTimestamp.current < 16) {
        return;
      }
      lastUpdateTimestamp.current = now;

      mousePosition.current = { x: clientX, y: clientY };
      touchPosition.current = { x: clientX, y: clientY };

      if (!isDragStarted.current) {
        isDragStarted.current = true;
      }

      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(() => {
        const deltaX = mousePosition.current.x - startPosition.current!.x;
        const deltaY = mousePosition.current.y - startPosition.current!.y;

        updateElementWithoutHistory(elementId, {
          position: {
            x: elementInitialPos.current!.x + deltaX,
            y: elementInitialPos.current!.y + deltaY
          },
          style: {
            ...currentElement?.style,
            transform: 'scale(1.02)',
            transition: 'transform 0.2s ease',
            willChange: 'transform',
            cursor: 'grabbing',
            boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
            zIndex: 9999,
          }
        });
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      if (isDragStarted.current) {
        if (currentElement) {
          updateElementWithoutHistory(elementId, {
            style: {
              ...currentElement.style,
              transform: 'scale(1)',
              transition: 'all 0.2s ease',
              willChange: 'auto',
              cursor: 'grab',
              boxShadow: 'none',
            }
          });
        }
        commitToHistory();
      }

      setIsDragging(false);
      isDragStarted.current = false;
      startPosition.current = null;
      elementInitialPos.current = null;

      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);

      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory, currentElement, isGameMode, isImageElement]);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, initialPosition: Position) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    setIsDragging(true);

    if ('touches' in e) {
      const touch = e.touches[0];
      startPosition.current = { x: touch.clientX, y: touch.clientY };
      touchPosition.current = { x: touch.clientX, y: touch.clientY };
    } else {
      startPosition.current = { x: e.clientX, y: e.clientY };
      mousePosition.current = { x: e.clientX, y: e.clientY };
    }

    elementInitialPos.current = initialPosition;
    isDragStarted.current = false;

    if (currentElement) {
      updateElementWithoutHistory(elementId, {
        style: {
          ...currentElement.style,
          willChange: 'transform',
          cursor: 'grabbing',
          transition: 'transform 0.1s ease',
        }
      });
    }
  }, [elementId, currentElement, isGameMode, isImageElement, updateElementWithoutHistory]);

  return { startDrag, isDragging, currentElement };
};
