import { useState, useCallback } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface DragState {
  elementWidth: number;   // Element's width for center calculation
  elementHeight: number;  // Element's height for center calculation
  initialLeft: number;    // Initial element position relative to canvas
  initialTop: number;     // Initial element position relative to canvas
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const { isMobileDevice } = useMobile();
  const currentElement = elements.find(el => el.id === elementId);
  
  const isImageElement = currentElement?.type === 'image';

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragState) return;

    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const element = document.getElementById(`element-${elementId}`);
    if (element && element.parentElement) {
      const canvas = element.parentElement;
      const canvasRect = canvas.getBoundingClientRect();
      
      // Calculate new position with the cursor at the center of the element
      const newLeft = clientX - canvasRect.left - (dragState.elementWidth / 2);
      const newTop = clientY - canvasRect.top - (dragState.elementHeight / 2);

      // Update DOM position immediately for smooth dragging
      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;

      // Update React state less frequently
      requestAnimationFrame(() => {
        updateElementWithoutHistory(elementId, {
          position: {
            x: newLeft,
            y: newTop
          }
        });
      });
    }
  }, [elementId, isDragging, dragState, updateElementWithoutHistory]);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    
    const element = document.getElementById(`element-${elementId}`);
    if (!element || !element.parentElement) return;
    
    const canvas = element.parentElement;
    const canvasRect = canvas.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    setDragState({
      elementWidth: elementRect.width,
      elementHeight: elementRect.height,
      initialLeft: elementRect.left - canvasRect.left,
      initialTop: elementRect.top - canvasRect.top
    });
    
    setIsDragging(true);
  }, [elementId, isGameMode, isImageElement, currentElement?.interaction?.type]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const element = document.getElementById(`element-${elementId}`);
    if (element && element.parentElement) {
      const canvas = element.parentElement;
      const canvasRect = canvas.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Calculate final position relative to canvas
      const finalLeft = elementRect.left - canvasRect.left;
      const finalTop = elementRect.top - canvasRect.top;

      updateElementWithoutHistory(elementId, {
        position: {
          x: finalLeft,
          y: finalTop
        }
      });
      commitToHistory();
    }

    setIsDragging(false);
    setDragState(null);
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory]);

  return { startDrag, isDragging, currentElement, handleMove, handleEnd };
};
