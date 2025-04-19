
import { useState, useCallback } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface DragState {
  startX: number;
  startY: number;
  elementStartLeft: number;
  elementStartTop: number;
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
      e.preventDefault(); // Prevent scrolling on mobile
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculate new position based on the initial click/touch point
    const deltaX = clientX - dragState.startX;
    const deltaY = clientY - dragState.startY;
    
    const newLeft = dragState.elementStartLeft + deltaX;
    const newTop = dragState.elementStartTop + deltaY;

    // Update DOM position immediately for smooth dragging
    const element = document.getElementById(`element-${elementId}`);
    if (element) {
      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;

      // Update React state less frequently using requestAnimationFrame
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
    if (!element) return;
    
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

    // Store the initial mouse/touch position and element position
    setDragState({
      startX: clientX,
      startY: clientY,
      elementStartLeft: element.offsetLeft,
      elementStartTop: element.offsetTop
    });
    
    setIsDragging(true);
  }, [elementId, isGameMode, isImageElement, currentElement?.interaction?.type]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const element = document.getElementById(`element-${elementId}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const canvas = element.parentElement;
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const finalLeft = rect.left - canvasRect.left;
        const finalTop = rect.top - canvasRect.top;

        updateElementWithoutHistory(elementId, {
          position: {
            x: finalLeft,
            y: finalTop
          }
        });
        commitToHistory();
      }
    }

    setIsDragging(false);
    setDragState(null);
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory]);

  return { startDrag, isDragging, currentElement, handleMove, handleEnd };
};
