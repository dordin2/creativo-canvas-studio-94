
import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { viewportToCanvasCoordinates, getCanvasScale, getEventCoordinates } from '@/utils/coordinateUtils';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements, draggedInventoryItem, handleItemCombination, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef<Position | null>(null);
  const elementInitialPos = useRef<Position | null>(null);
  const isDragStarted = useRef<boolean>(false);
  const animationFrame = useRef<number | null>(null);
  const dragStartOffset = useRef<Position | null>(null);
  
  // Find the current element to access its properties
  const currentElement = elements.find(el => el.id === elementId);
  
  // Check if this is a puzzle element or image
  const isPuzzleElement = currentElement?.type === 'puzzle';
  const isSequencePuzzleElement = currentElement?.type === 'sequencePuzzle';
  const isSliderPuzzleElement = currentElement?.type === 'sliderPuzzle';
  const isImageElement = currentElement?.type === 'image';

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !startPosition.current || !elementInitialPos.current || !dragStartOffset.current) return;
    
    // Don't drag images in game mode unless they are interactive
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      return;
    }

    // Get the event coordinates
    const coords = getEventCoordinates(e);

    // Get the canvas container and its properties
    const canvasContainer = document.querySelector('.canvas-container') as HTMLElement;
    if (!canvasContainer) return;

    const canvasRect = canvasContainer.getBoundingClientRect();
    const canvasScale = getCanvasScale(canvasContainer);
    
    // Calculate new position based on event movement and canvas scale
    const currentPos = viewportToCanvasCoordinates(coords.clientX, coords.clientY, {
      canvasScale,
      canvasRect
    });
    
    const startPos = viewportToCanvasCoordinates(startPosition.current.x, startPosition.current.y, {
      canvasScale,
      canvasRect
    });
    
    // Calculate the delta movement accounting for scale
    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;

    // Mark that we've started dragging (for history tracking)
    if (!isDragStarted.current) {
      isDragStarted.current = true;
    }

    // Cancel any existing animation frame
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
    }

    // Use requestAnimationFrame for smooth updates
    animationFrame.current = requestAnimationFrame(() => {
      // Calculate new position relative to initial element position
      const newX = elementInitialPos.current!.x + deltaX;
      const newY = elementInitialPos.current!.y + deltaY;
      
      // Update element position
      updateElementWithoutHistory(elementId, {
        position: { x: newX, y: newY },
        style: {
          ...currentElement?.style,
          willChange: 'transform',
        }
      });
    });
  };

  const handleDragEnd = () => {
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

  useEffect(() => {
    if (isDragging) {
      // Add both mouse and touch event listeners
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      // Clean up both mouse and touch event listeners
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
      
      // Clean up any pending animation frame
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [isDragging, elementId]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent, initialPosition: Position) => {
    // Don't start drag for static images in game mode
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    // Prevent browser's native drag behavior and scrolling
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getEventCoordinates(e.nativeEvent);
    setIsDragging(true);
    
    // Store the initial event position
    startPosition.current = { x: coords.clientX, y: coords.clientY };
    elementInitialPos.current = initialPosition;
    isDragStarted.current = false;
    
    // Store the offset between event position and element position
    const canvasContainer = document.querySelector('.canvas-container') as HTMLElement;
    if (canvasContainer) {
      const canvasRect = canvasContainer.getBoundingClientRect();
      const canvasScale = getCanvasScale(canvasContainer);
      
      const elementPos = viewportToCanvasCoordinates(coords.clientX, coords.clientY, {
        canvasScale,
        canvasRect
      });
      
      dragStartOffset.current = {
        x: elementPos.x - initialPosition.x,
        y: elementPos.y - initialPosition.y
      };
    }
    
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

