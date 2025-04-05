
import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef<Position | null>(null);
  const elementInitialPos = useRef<Position | null>(null);
  const isDragStarted = useRef<boolean>(false);

  // Find the current element to access its properties
  const currentElement = elements.find(el => el.id === elementId);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !startPosition.current || !elementInitialPos.current) return;

      // Mark that we've started dragging (for history tracking)
      if (!isDragStarted.current) {
        isDragStarted.current = true;
      }

      // Calculate the new position
      const deltaX = e.clientX - startPosition.current.x;
      const deltaY = e.clientY - startPosition.current.y;

      const newX = elementInitialPos.current.x + deltaX;
      const newY = elementInitialPos.current.y + deltaY;
      
      // Immediately update the element's position for responsive dragging
      updateElementWithoutHistory(elementId, { 
        position: { x: newX, y: newY }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // If we actually dragged (not just clicked), commit the final position to history
      if (isDragStarted.current) {
        commitToHistory();
        isDragStarted.current = false;
      }
      
      startPosition.current = null;
      elementInitialPos.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory]);

  const startDrag = (e: React.MouseEvent, initialPosition: Position) => {
    e.stopPropagation();
    setIsDragging(true);
    startPosition.current = { x: e.clientX, y: e.clientY };
    elementInitialPos.current = initialPosition;
    isDragStarted.current = false; // Reset the drag started flag
  };

  return { startDrag, isDragging, currentElement };
};
