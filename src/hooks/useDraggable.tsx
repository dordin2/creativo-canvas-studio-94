
import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElement, elements } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef<Position | null>(null);
  const elementInitialPos = useRef<Position | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentPosition = useRef<Position | null>(null);

  // Find the current element to access its properties
  const currentElement = elements.find(el => el.id === elementId);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !startPosition.current || !elementInitialPos.current) return;

      // Calculate the new position
      const deltaX = e.clientX - startPosition.current.x;
      const deltaY = e.clientY - startPosition.current.y;

      const newX = elementInitialPos.current.x + deltaX;
      const newY = elementInitialPos.current.y + deltaY;
      
      // Store the current position for use in the animation frame
      currentPosition.current = { x: newX, y: newY };
      
      // If there's no animation frame requested yet, request one
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          // Only update if we have a position
          if (currentPosition.current) {
            updateElement(elementId, { 
              position: currentPosition.current
            });
          }
          // Reset the animation frame reference
          rafRef.current = null;
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      startPosition.current = null;
      elementInitialPos.current = null;
      
      // Cancel any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Cleanup any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isDragging, elementId, updateElement]);

  const startDrag = (e: React.MouseEvent, initialPosition: Position) => {
    e.stopPropagation();
    setIsDragging(true);
    startPosition.current = { x: e.clientX, y: e.clientY };
    elementInitialPos.current = initialPosition;
  };

  return { startDrag, isDragging, currentElement };
};
