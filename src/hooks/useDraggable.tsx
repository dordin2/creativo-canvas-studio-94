import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

interface DragOffset {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements, draggedInventoryItem, handleItemCombination, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const isDragStarted = useRef<boolean>(false);
  const lastUpdateTimestamp = useRef<number>(0);
  const dragOffsetRef = useRef<DragOffset>({ x: 0, y: 0 });
  const elementBoundsRef = useRef<DOMRect | null>(null);

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
    const isWithinBounds = (clientX: number, clientY: number, bounds: DOMRect): boolean => {
      const tolerance = 10; // Allow a small area outside the bounds
      return (
        clientX >= bounds.left - tolerance &&
        clientX <= bounds.right + tolerance &&
        clientY >= bounds.top - tolerance &&
        clientY <= bounds.bottom + tolerance
      );
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging || !currentElement) return;

      if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
        return;
      }

      const now = Date.now();
      if (now - lastUpdateTimestamp.current < 16) {
        return;
      }
      lastUpdateTimestamp.current = now;

      // Check if cursor is within element bounds
      if (elementBoundsRef.current && !isWithinBounds(clientX, clientY, elementBoundsRef.current)) {
        handleEnd();
        return;
      }

      const newX = clientX - dragOffsetRef.current.x;
      const newY = clientY - dragOffsetRef.current.y;

      updateElementWithoutHistory(elementId, {
        position: { x: newX, y: newY },
        style: {
          ...currentElement.style,
          transform: `translate3d(0, 0, 0)`,
          transition: 'none',
          cursor: 'grabbing',
          willChange: 'transform'
        }
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
      elementBoundsRef.current = null;

      if (currentElement) {
        updateElementWithoutHistory(elementId, {
          style: {
            ...currentElement.style,
            transform: 'none',
            transition: 'none',
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

    const element = document.getElementById(`element-${elementId}`);
    if (element && currentElement) {
      const rect = element.getBoundingClientRect();
      elementBoundsRef.current = rect;
      
      let clientX: number, clientY: number;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      dragOffsetRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };

      updateElementWithoutHistory(elementId, {
        style: {
          ...currentElement.style,
          cursor: 'grabbing',
          willChange: 'transform',
          transition: 'none'
        }
      });
    }
  };

  return { startDrag, isDragging, currentElement };
};
