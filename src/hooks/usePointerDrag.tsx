
import { useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

export const usePointerDrag = (
  elementId: string,
  onDragStart?: (position: Position) => void,
  onDragEnd?: () => void
) => {
  const { updateElementWithoutHistory, commitToHistory, elements, isGameMode } = useDesignState();
  const dragIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  
  const currentElement = elements.find(el => el.id === elementId);
  const isPuzzleElement = currentElement?.type === 'puzzle';
  const isSequencePuzzleElement = currentElement?.type === 'sequencePuzzle';
  const isSliderPuzzleElement = currentElement?.type === 'sliderPuzzle';
  const isImageElement = currentElement?.type === 'image';

  useEffect(() => {
    if (!currentElement) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      
      dragIdRef.current = e.pointerId;
      isDraggingRef.current = true;
      
      if (onDragStart) {
        onDragStart(currentElement.position);
      }

      target.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || e.pointerId !== dragIdRef.current) return;
      
      e.preventDefault();

      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      
      // Calculate the center position by subtracting half the element's width and height
      const x = Math.round(e.clientX - rect.width / 2);
      const y = Math.round(e.clientY - rect.height / 2);

      updateElementWithoutHistory(elementId, {
        position: { x, y }
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== dragIdRef.current) return;
      
      const target = e.currentTarget as HTMLElement;
      target.releasePointerCapture(dragIdRef.current!);
      target.style.cursor = 'grab';
      
      isDraggingRef.current = false;
      dragIdRef.current = null;
      
      if (currentElement) {
        commitToHistory();
      }
      
      if (onDragEnd) {
        onDragEnd();
      }
    };

    const element = document.getElementById(`element-${elementId}`);
    if (element) {
      element.style.touchAction = 'none';
      element.style.userSelect = 'none';
      element.style.cursor = 'grab';
      
      element.addEventListener('pointerdown', handlePointerDown);
      element.addEventListener('pointermove', handlePointerMove);
      element.addEventListener('pointerup', handlePointerUp);
      element.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      if (element) {
        element.removeEventListener('pointerdown', handlePointerDown);
        element.removeEventListener('pointermove', handlePointerMove);
        element.removeEventListener('pointerup', handlePointerUp);
        element.removeEventListener('pointercancel', handlePointerUp);
      }
    };
  }, [elementId, currentElement, updateElementWithoutHistory, commitToHistory, isGameMode, isImageElement, onDragStart, onDragEnd]);

  return {
    isDragging: isDraggingRef.current,
    currentElement
  };
};
