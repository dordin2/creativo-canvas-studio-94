import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements, draggedInventoryItem, handleItemCombination, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<Position | null>(null);
  const isDragStarted = useRef<boolean>(false);
  const animationFrame = useRef<number | null>(null);
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
      if (!isDragging || !currentElement) return;

      if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
        return;
      }

      const now = Date.now();
      if (now - lastUpdateTimestamp.current < 16) { // Limit to ~60fps
        return;
      }
      lastUpdateTimestamp.current = now;

      // Get element dimensions for center calculation
      const element = document.getElementById(`element-${elementId}`);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerOffsetX = rect.width / 2;
      const centerOffsetY = rect.height / 2;

      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(() => {
        // Calculate new position with cursor at center
        const newX = clientX - centerOffsetX;
        const newY = clientY - centerOffsetY;

        updateElementWithoutHistory(elementId, {
          position: { x: newX, y: newY }
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
        commitToHistory();
      }

      setIsDragging(false);
      isDragStarted.current = false;
      elementRef.current = null;

      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }

      // Reset element styles
      const element = document.getElementById(`element-${elementId}`);
      if (element && currentElement) {
        updateElementWithoutHistory(elementId, {
          style: {
            ...currentElement.style,
            transform: currentElement.style?.transform || 'none',
            transition: 'transform 0.2s ease',
            cursor: 'grab',
            willChange: 'auto'
          }
        });
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

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    setIsDragging(true);
    isDragStarted.current = true;

    // Set initial grab cursor and prepare for movement
    if (currentElement) {
      updateElementWithoutHistory(elementId, {
        style: {
          ...currentElement.style,
          cursor: 'grabbing',
          willChange: 'transform'
        }
      });
    }
  };

  return { startDrag, isDragging, currentElement };
};
