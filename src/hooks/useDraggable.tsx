
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
  const rafRef = useRef<number | null>(null);
  const currentPosition = useRef<Position | null>(null);
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
      
      // Store the current position for use in the animation frame
      currentPosition.current = { x: newX, y: newY };
      
      // If there's no animation frame requested yet, request one
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          // Only update if we have a position
          if (currentPosition.current) {
            // Use updateElementWithoutHistory to avoid adding every movement to history
            updateElementWithoutHistory(elementId, { 
              position: currentPosition.current
            });
          }
          // Reset the animation frame reference
          rafRef.current = null;
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      
      // Stop propagation to prevent unwanted behavior
      e.stopPropagation();
      
      // If we actually dragged (not just clicked), commit the final position to history
      if (isDragStarted.current) {
        commitToHistory();
        isDragStarted.current = false;
      }
      
      startPosition.current = null;
      elementInitialPos.current = null;
      
      // Cancel any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: false });
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
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory]);

  const startDrag = (e: React.MouseEvent, initialPosition: Position) => {
    // Prevent default browser behavior
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    startPosition.current = { x: e.clientX, y: e.clientY };
    elementInitialPos.current = initialPosition;
    isDragStarted.current = false; // Reset the drag started flag
  };

  return { startDrag, isDragging, currentElement };
};
