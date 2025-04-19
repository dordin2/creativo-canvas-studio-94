
import { useState, useCallback } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface DragState {
  grabX: number;  // Cursor position relative to element's top-left corner
  grabY: number;
  elementX: number; // Element's initial position
  elementY: number;
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
    
    const element = document.getElementById(`element-${elementId}`);
    if (!element) return;

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

    // Calculate new position by maintaining the exact grab point
    const newLeft = clientX - dragState.grabX;
    const newTop = clientY - dragState.grabY;

    // Update DOM position immediately for smooth dragging
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
    
    const rect = element.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculate the exact grab point relative to the element's top-left corner
    const grabX = clientX - rect.left;
    const grabY = clientY - rect.top;

    // Store both grab point and initial element position
    setDragState({
      grabX,
      grabY,
      elementX: rect.left,
      elementY: rect.top
    });
    
    setIsDragging(true);
  }, [elementId, isGameMode, isImageElement, currentElement?.interaction?.type]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const element = document.getElementById(`element-${elementId}`);
    if (!element) return;

    const rect = element.getBoundingClientRect();

    // Commit the final position to history using getBoundingClientRect
    updateElementWithoutHistory(elementId, {
      position: {
        x: rect.left,
        y: rect.top
      }
    });
    commitToHistory();

    setIsDragging(false);
    setDragState(null);
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory]);

  return { startDrag, isDragging, currentElement, handleMove, handleEnd };
};
