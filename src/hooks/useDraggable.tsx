
import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

interface DragState {
  initialMouseX: number;
  initialMouseY: number;
  initialTransformX: number;
  initialTransformY: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements, draggedInventoryItem, handleItemCombination, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const isDragStarted = useRef<boolean>(false);
  const dragStateRef = useRef<DragState | null>(null);
  const rafRef = useRef<number | null>(null);

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
    const updateElementPosition = (clientX: number, clientY: number) => {
      if (!isDragging || !currentElement || !dragStateRef.current) return;

      if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
        return;
      }

      // Calculate the delta from initial mouse position
      const deltaX = clientX - dragStateRef.current.initialMouseX;
      const deltaY = clientY - dragStateRef.current.initialMouseY;

      // Apply transform directly for immediate visual feedback
      const element = document.getElementById(`element-${elementId}`);
      if (element) {
        const transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
        element.style.transform = transform;
        element.style.transition = 'none';
      }

      // Update the actual position state on the next frame
      updateElementWithoutHistory(elementId, {
        position: {
          x: dragStateRef.current.initialTransformX + deltaX,
          y: dragStateRef.current.initialTransformY + deltaY
        },
        style: {
          ...currentElement.style,
          transform: 'translate3d(0, 0, 0)',
          transition: 'none',
          cursor: 'grabbing',
          willChange: 'transform'
        }
      });
    };

    const handleMove = (e: MouseEvent | Touch) => {
      e instanceof MouseEvent && e.preventDefault();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        updateElementPosition(e.clientX, e.clientY);
      });
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0]);

    const handleEnd = () => {
      if (isDragStarted.current) {
        commitToHistory();
      }

      setIsDragging(false);
      isDragStarted.current = false;
      dragStateRef.current = null;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // Reset transforms after drag
      const element = document.getElementById(`element-${elementId}`);
      if (element) {
        element.style.transform = 'none';
      }

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
      window.addEventListener('mousemove', handleMouseMove, { passive: false });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
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
      let clientX: number, clientY: number;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Store initial positions for accurate delta calculations
      dragStateRef.current = {
        initialMouseX: clientX,
        initialMouseY: clientY,
        initialTransformX: currentElement.position.x,
        initialTransformY: currentElement.position.y
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
