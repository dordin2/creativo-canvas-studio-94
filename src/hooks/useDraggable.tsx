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
  const dragOffset = useRef<DragOffset | null>(null);
  const initialTransform = useRef<string>('');
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
      if (!isDragging || !dragOffset.current || !currentElement) return;
      
      if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
        return;
      }

      const now = Date.now();
      if (now - lastUpdateTimestamp.current < 16) {
        return;
      }
      lastUpdateTimestamp.current = now;

      const x = clientX - dragOffset.current.x;
      const y = clientY - dragOffset.current.y;

      updateElementWithoutHistory(elementId, {
        position: { x, y },
        style: {
          ...currentElement.style,
          transform: `translate3d(${x}px, ${y}px, 0)`,
          willChange: 'transform',
          cursor: 'grabbing',
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
          zIndex: 9999,
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      if (!currentElement) return;
      
      setIsDragging(false);
      dragOffset.current = null;

      updateElementWithoutHistory(elementId, {
        style: {
          ...currentElement.style,
          transform: initialTransform.current || 'none',
          willChange: 'auto',
          cursor: 'grab',
          boxShadow: 'none',
        }
      });
      
      commitToHistory();
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

  const startDrag = (e: React.MouseEvent | React.TouchEvent, initialPosition: Position) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    
    const element = document.getElementById(`element-${elementId}`);
    if (!element || !currentElement) return;

    const rect = element.getBoundingClientRect();
    initialTransform.current = currentElement.style?.transform || 'none';
    
    if ('touches' in e) {
      const touch = e.touches[0];
      dragOffset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    setIsDragging(true);

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
