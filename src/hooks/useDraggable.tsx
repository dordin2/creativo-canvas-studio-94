
import { useState, useCallback } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface DragState {
  startX: number;  // Initial mouse/touch position relative to element edge
  startY: number;
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
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculate new position by maintaining the initial grab offset
    const newLeft = clientX - dragState.startX;
    const newTop = clientY - dragState.startY;

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
    
    if ('touches' in e) {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
      // Prevent scrolling on mobile while dragging
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate offset from cursor to element edge (sticky point)
    const startX = clientX - element.offsetLeft;
    const startY = clientY - element.offsetTop;
    
    setDragState({ startX, startY });
    setIsDragging(true);
  }, [elementId, isGameMode, isImageElement, currentElement?.interaction?.type]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const element = document.getElementById(`element-${elementId}`);
    if (!element) return;

    // Commit the final position to history
    updateElementWithoutHistory(elementId, {
      position: {
        x: element.offsetLeft,
        y: element.offsetTop
      }
    });
    commitToHistory();

    setIsDragging(false);
    setDragState(null);
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory]);

  return { startDrag, isDragging, currentElement, handleMove, handleEnd };
};
