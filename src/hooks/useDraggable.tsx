
import { useState, useRef, useCallback } from 'react';
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
  
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const element = document.getElementById(`element-${elementId}`);
    if (!element) return;

    // Update the element position directly in the DOM for immediate response
    const deltaX = clientX - element.offsetLeft;
    const deltaY = clientY - element.offsetTop;

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

    const element = document.getElementById(`element-${elementId}`);
    if (!element) return;

    if ('touches' in e && isMobileDevice) {
      const touch = e.touches[0];
      element.style.transform = '';
    } else if (!isMobileDevice) {
      const mouseEvent = e as React.MouseEvent;
      element.style.transform = '';
    }
  }, [elementId, isGameMode, isImageElement, currentElement, isMobileDevice]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const element = document.getElementById(`element-${elementId}`);
    if (element) {
      const finalX = element.offsetLeft;
      const finalY = element.offsetTop;

      updateElementWithoutHistory(elementId, {
        position: { x: finalX, y: finalY }
      });
      commitToHistory();
    }

    setIsDragging(false);
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory]);

  return { startDrag, isDragging, currentElement, handleMove, handleEnd };
};
