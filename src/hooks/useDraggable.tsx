
import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, updateMultipleElementsWithoutHistory, commitToHistory, elements } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef<Position | null>(null);
  const elementInitialPos = useRef<Position | null>(null);
  const isDragStarted = useRef<boolean>(false);
  const animationFrame = useRef<number | null>(null);
  const mousePosition = useRef<Position>({ x: 0, y: 0 });
  const selectedElementsRef = useRef<string[]>([]);

  // Find the current element to access its properties
  const currentElement = elements.find(el => el.id === elementId);
  
  // Check if this is a puzzle element, slider puzzle, or image
  const isPuzzleElement = currentElement?.type === 'puzzle';
  const isSequencePuzzleElement = currentElement?.type === 'sequencePuzzle';
  const isSliderPuzzleElement = currentElement?.type === 'sliderPuzzle';
  const isImageElement = currentElement?.type === 'image';

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

        if (selectedElementsRef.current.length > 1) {
          // Update all selected elements
          updateMultipleElementsWithoutHistory(selectedElementsRef.current, (element) => {
            // Find the initial position of each element
            const elementPosition = elements.find(e => e.id === element.id)?.position || { x: 0, y: 0 };
            
            return {
              position: { 
                x: Math.round(elementPosition.x + deltaX), 
                y: Math.round(elementPosition.y + deltaY)
              },
              style: {
                ...element.style,
                willChange: 'transform',
              }
            };
          });
        } else {
          // Single element update
          const newX = Math.round(elementInitialPos.current!.x + deltaX);
          const newY = Math.round(elementInitialPos.current!.y + deltaY);
          
          // Immediately update the element's position for responsive dragging
          updateElementWithoutHistory(elementId, { 
            position: { x: newX, y: newY },
            style: {
              ...currentElement?.style,
              willChange: 'transform',
            }
          });
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // If we actually dragged (not just clicked), commit the final position to history
      if (isDragStarted.current) {
        if (selectedElementsRef.current.length > 1) {
          // Reset willChange property for all elements
          updateMultipleElementsWithoutHistory(selectedElementsRef.current, (element) => ({
            style: {
              ...element.style,
              willChange: 'auto',
            }
          }));
        } else if (currentElement) {
          // Reset willChange property for single element
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
      selectedElementsRef.current = [];
      
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
  }, [isDragging, elementId, updateElementWithoutHistory, updateMultipleElementsWithoutHistory, commitToHistory, currentElement, elements]);

  const startDrag = (e: React.MouseEvent, initialPosition: Position, selectedElements: string[] = [elementId]) => {
    // Prevent browser's native drag behavior for images and puzzle elements
    if (isImageElement || isPuzzleElement || isSliderPuzzleElement) {
      e.preventDefault();
    }
    
    e.stopPropagation();
    setIsDragging(true);
    startPosition.current = { x: e.clientX, y: e.clientY };
    elementInitialPos.current = initialPosition;
    selectedElementsRef.current = selectedElements;
    isDragStarted.current = false; // Reset the drag started flag
    
    // Set willChange to transform for better performance during drag
    if (selectedElements.length > 1) {
      // Set for all selected elements
      updateMultipleElementsWithoutHistory(selectedElements, (element) => ({
        style: {
          ...element.style,
          willChange: 'transform',
        }
      }));
    } else if (currentElement) {
      // Set for single element
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
