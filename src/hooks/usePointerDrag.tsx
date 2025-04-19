
import { useEffect, useRef } from 'react';
import { DesignElement, useDesignState } from '@/context/DesignContext';

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
  const offsetRef = useRef({ x: 0, y: 0 });
  const elementInitialPosRef = useRef<Position | null>(null);
  const lastUpdateTimestamp = useRef<number>(0);
  
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
      
      // Calculate offset from click point to element origin
      const rect = target.getBoundingClientRect();
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      elementInitialPosRef.current = currentElement.position;
      
      if (onDragStart) {
        onDragStart(currentElement.position);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || e.pointerId !== dragIdRef.current) return;
      
      e.preventDefault();
      
      // Throttle updates to prevent excessive rendering
      const now = Date.now();
      if (now - lastUpdateTimestamp.current < 16) {
        return;
      }
      lastUpdateTimestamp.current = now;

      if (!elementInitialPosRef.current) return;

      // Calculate new position based on pointer movement and initial offset
      const x = e.clientX - offsetRef.current.x;
      const y = e.clientY - offsetRef.current.y;

      updateElementWithoutHistory(elementId, {
        position: { x, y },
        style: {
          ...currentElement.style,
          transform: 'scale(1.02)',
          transition: 'transform 0.2s ease',
          willChange: 'transform',
          cursor: 'grabbing',
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
          zIndex: 9999,
        }
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== dragIdRef.current) return;
      
      const target = e.currentTarget as HTMLElement;
      target.releasePointerCapture(dragIdRef.current!);
      
      isDraggingRef.current = false;
      dragIdRef.current = null;
      
      if (currentElement) {
        updateElementWithoutHistory(elementId, {
          style: {
            ...currentElement.style,
            transform: 'scale(1)',
            transition: 'all 0.2s ease',
            willChange: 'auto',
            cursor: 'grab',
            boxShadow: 'none',
          }
        });
        commitToHistory();
      }
      
      if (onDragEnd) {
        onDragEnd();
      }
    };

    // Find the element and attach listeners
    const element = document.getElementById(`element-${elementId}`);
    if (element) {
      // Prevent default touch behaviors
      element.style.touchAction = 'none';
      element.style.userSelect = 'none';
      
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
