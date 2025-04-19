
import { useState, useCallback } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface DragState {
  grabPointX: number;    // Mouse offset from element's top-left corner
  grabPointY: number;    // Mouse offset from element's top-left corner
  initialLeft: number;   // Initial element position relative to canvas
  initialTop: number;
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

    // Calculate new position while maintaining the grab point offset
    const newLeft = clientX - dragState.grabPointX;
    const newTop = clientY - dragState.grabPointY;

    const element = document.getElementById(`element-${elementId}`);
    if (element && element.parentElement) {
      const canvas = element.parentElement;
      const canvasRect = canvas.getBoundingClientRect();
      
      // Convert page coordinates to canvas-relative coordinates
      const canvasX = newLeft - canvasRect.left;
      const canvasY = newTop - canvasRect.top;

      // Update DOM position immediately for smooth dragging
      element.style.left = `${canvasX}px`;
      element.style.top = `${canvasY}px`;

      // Update React state less frequently
      requestAnimationFrame(() => {
        updateElementWithoutHistory(elementId, {
          position: {
            x: canvasX,
            y: canvasY
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

    // Calculate grab point offset from element's top-left corner
    const grabPointX = clientX - elementRect.left;
    const grabPointY = clientY - elementRect.top;

    setDragState({
      grabPointX,
      grabPointY,
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
