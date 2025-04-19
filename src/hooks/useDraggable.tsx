
import { useState, useRef, useCallback } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements, draggedInventoryItem, handleItemCombination, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosition = useRef<Position | null>(null);
  const elementStartPosition = useRef<Position | null>(null);
  const { isMobileDevice } = useMobile();
  const currentElement = elements.find(el => el.id === elementId);
  
  const isPuzzleElement = currentElement?.type === 'puzzle';
  const isSequencePuzzleElement = currentElement?.type === 'sequencePuzzle';
  const isSliderPuzzleElement = currentElement?.type === 'sliderPuzzle';
  const isImageElement = currentElement?.type === 'image';
  
  const updateElementPosition = useCallback((clientX: number, clientY: number) => {
    if (!dragStartPosition.current || !elementStartPosition.current) return;
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) return;

    // Calculate the offset from where the drag started
    const deltaX = clientX - dragStartPosition.current.x;
    const deltaY = clientY - dragStartPosition.current.y;

    // Update the element position directly in the DOM first for immediate response
    const element = document.getElementById(`element-${elementId}`);
    if (element) {
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    // Then update the React state with a debounced effect
    requestAnimationFrame(() => {
      const newLeft = elementStartPosition.current!.x + deltaX;
      const newTop = elementStartPosition.current!.y + deltaY;

      updateElementWithoutHistory(elementId, {
        position: {
          x: newLeft,
          y: newTop
        }
      });
    });
  }, [elementId, updateElementWithoutHistory, isGameMode, isImageElement, currentElement?.interaction?.type]);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, elementPosition?: Position) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    setIsDragging(true);

    if ('touches' in e && isMobileDevice) {
      const touch = e.touches[0];
      dragStartPosition.current = { 
        x: touch.clientX, 
        y: touch.clientY 
      };
    } else if (!isMobileDevice) {
      const mouseEvent = e as React.MouseEvent;
      dragStartPosition.current = { 
        x: mouseEvent.clientX, 
        y: mouseEvent.clientY 
      };
    }

    if (currentElement) {
      elementStartPosition.current = elementPosition || { 
        x: currentElement.position.x, 
        y: currentElement.position.y 
      };

      // Reset any existing transform
      const element = document.getElementById(`element-${elementId}`);
      if (element) {
        element.style.transform = '';
      }
    }
  }, [elementId, isGameMode, isImageElement, currentElement, isMobileDevice]);

  // Effect for handling mouse/touch move and end events
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (isDragging) {
      updateElementPosition(clientX, clientY);
    }
  }, [isDragging, updateElementPosition]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const element = document.getElementById(`element-${elementId}`);
    if (element) {
      element.style.transform = '';
    }

    if (dragStartPosition.current && elementStartPosition.current) {
      const finalX = elementStartPosition.current.x + (element?.offsetLeft || 0);
      const finalY = elementStartPosition.current.y + (element?.offsetTop || 0);

      updateElementWithoutHistory(elementId, {
        position: { x: finalX, y: finalY }
      });
      commitToHistory();
    }

    setIsDragging(false);
    dragStartPosition.current = null;
    elementStartPosition.current = null;
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory]);

  return { startDrag, isDragging, currentElement };
};
