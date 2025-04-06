
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
  const animationFrame = useRef<number | null>(null);
  const mousePosition = useRef<Position>({ x: 0, y: 0 });

  // Find the current element to access its properties
  const currentElement = elements.find(el => el.id === elementId);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !startPosition.current || !elementInitialPos.current) return;
      
      // Update current mouse position immediately for responsive feel
      mousePosition.current = { x: e.clientX, y: e.clientY };

      // Mark that we've started dragging (for history tracking)
      if (!isDragStarted.current) {
        isDragStarted.current = true;
      }

      // Cancel any existing animation frame to prevent queuing updates
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }

      // Use requestAnimationFrame for smooth updates
      animationFrame.current = requestAnimationFrame(() => {
        // Calculate the new position
        const deltaX = mousePosition.current.x - startPosition.current!.x;
        const deltaY = mousePosition.current.y - startPosition.current!.y;

        const newX = elementInitialPos.current!.x + deltaX;
        const newY = elementInitialPos.current!.y + deltaY;
        
        // Immediately update the element's position for responsive dragging
        updateElementWithoutHistory(elementId, { 
          position: { x: newX, y: newY },
          style: {
            ...currentElement?.style,
            willChange: 'transform',
          }
        });
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // If we actually dragged (not just clicked), commit the final position to history
      if (isDragStarted.current) {
        // Reset willChange property when dragging ends
        if (currentElement) {
          updateElementWithoutHistory(elementId, {
            style: {
              ...currentElement.style,
              willChange: 'auto',
            }
          });
        }
        
        commitToHistory();
        isDragStarted.current = false;
      }
      
      startPosition.current = null;
      elementInitialPos.current = null;
      
      // Cancel any pending animation frame
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Clean up any pending animation frame
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory, currentElement]);

  const startDrag = (e: React.MouseEvent, initialPosition: Position) => {
    e.stopPropagation();
    setIsDragging(true);
    startPosition.current = { x: e.clientX, y: e.clientY };
    elementInitialPos.current = initialPosition;
    isDragStarted.current = false; // Reset the drag started flag
    
    // Set willChange to transform for better performance during drag
    if (currentElement) {
      updateElementWithoutHistory(elementId, {
        style: {
          ...currentElement.style,
          willChange: 'transform',
        }
      });
    }
  };

  return { startDrag, isDragging, currentElement };
};
