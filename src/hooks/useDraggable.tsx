
import { useState, useCallback } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const { isMobileDevice } = useMobile();
  const currentElement = elements.find(el => el.id === elementId);
  
  const isImageElement = currentElement?.type === 'image';
  
  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const element = document.getElementById(`element-${elementId}`);
    if (!element) return;

    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Update the element position directly in the DOM for immediate response
    const rect = element.getBoundingClientRect();
    const deltaX = clientX - rect.left;
    const deltaY = clientY - rect.top;

    element.style.left = `${clientX - deltaX}px`;
    element.style.top = `${clientY - deltaY}px`;

    // Update React state less frequently using requestAnimationFrame
    requestAnimationFrame(() => {
      updateElementWithoutHistory(elementId, {
        position: {
          x: clientX - deltaX,
          y: clientY - deltaY
        }
      });
    });
  }, [elementId, isDragging, updateElementWithoutHistory]);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    setIsDragging(true);
  }, [elementId, isGameMode, isImageElement, currentElement?.interaction?.type]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const element = document.getElementById(`element-${elementId}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const finalX = rect.left;
      const finalY = rect.top;

      updateElementWithoutHistory(elementId, {
        position: { x: finalX, y: finalY }
      });
      commitToHistory();
    }

    setIsDragging(false);
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory]);

  return { startDrag, isDragging, currentElement, handleMove, handleEnd };
};
