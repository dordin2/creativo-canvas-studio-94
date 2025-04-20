
import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { viewportToCanvasCoordinates, getCanvasScale } from '@/utils/coordinateUtils';

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
  
  // Check if this is a puzzle element, slider puzzle, or image
  const isPuzzleElement = currentElement?.type === 'puzzle';
  const isSequencePuzzleElement = currentElement?.type === 'sequencePuzzle';
  const isSliderPuzzleElement = currentElement?.type === 'sliderPuzzle';
  const isImageElement = currentElement?.type === 'image';

  // Handle drops from inventory items
  useEffect(() => {
    if (!currentElement) return;
    
    const handleDragOver = (e: MouseEvent) => {
      if (draggedInventoryItem && currentElement.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
        // Make the element a drop target
        const element = document.getElementById(`element-${elementId}`);
        if (element) {
          element.classList.add('drop-target');
        }
      }
    };
    
    const handleDragLeave = () => {
      const element = document.getElementById(`element-${elementId}`);
      if (element) {
        element.classList.remove('drop-target');
      }
    };
    
    // This will be called when another element is being custom-dragged over this element
    const handleCustomDragOver = (e: CustomEvent) => {
      if (!draggedInventoryItem) return;
      
      // Check if the mouse is over this element
      const element = document.getElementById(`element-${elementId}`);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.detail.clientX;
      const y = e.detail.clientY;
      
      // Check if the mouse is over this element
      if (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom
      ) {
        // Check if this element can interact with the dragged item
        if (currentElement.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
          element.classList.add('drop-target');
        }
      } else {
        element.classList.remove('drop-target');
      }
    };
    
    // This will be called when a custom drag operation ends over this element
    const handleCustomDrop = (e: CustomEvent) => {
      if (!draggedInventoryItem) return;
      
      const element = document.getElementById(`element-${elementId}`);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.detail.clientX;
      const y = e.detail.clientY;
      
      // Check if the drop happened over this element
      if (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom
      ) {
        // Check if this element can interact with the dragged item
        if (currentElement.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
          handleItemCombination(draggedInventoryItem.id, elementId);
        }
      }
      
      // Remove the drop-target class
      element.classList.remove('drop-target');
    };
    
    // Listen for custom events for drag-and-drop
    document.addEventListener('custom-drag-over', handleCustomDragOver as EventListener);
    document.addEventListener('custom-drop', handleCustomDrop as EventListener);
    
    return () => {
      document.removeEventListener('custom-drag-over', handleCustomDragOver as EventListener);
      document.removeEventListener('custom-drop', handleCustomDrop as EventListener);
    };
  }, [currentElement, draggedInventoryItem, elementId, handleItemCombination]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !startPosition.current || !elementInitialPos.current || !dragStartOffset.current) return;
      
      // Don't drag images in game mode unless they are interactive
      if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
        return;
      }

      // Get the canvas container and its properties
      const canvasContainer = document.querySelector('.canvas-container') as HTMLElement;
      if (!canvasContainer) return;

      const canvasRect = canvasContainer.getBoundingClientRect();
      const canvasScale = getCanvasScale(canvasContainer);
      
      // Calculate new position based on mouse movement and canvas scale
      const currentPos = viewportToCanvasCoordinates(e.clientX, e.clientY, {
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
  }, [isDragging, elementId, updateElementWithoutHistory, commitToHistory, currentElement, isGameMode, isImageElement]);

  const startDrag = (e: React.MouseEvent, initialPosition: Position) => {
    // Don't start drag for static images in game mode
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    // Prevent browser's native drag behavior for images and puzzle elements
    if (isImageElement || isPuzzleElement || isSliderPuzzleElement) {
      e.preventDefault();
    }
    
    e.stopPropagation();
    setIsDragging(true);
    
    // Store the initial mouse position
    startPosition.current = { x: e.clientX, y: e.clientY };
    elementInitialPos.current = initialPosition;
    isDragStarted.current = false;
    
    // Store the offset between mouse position and element position
    const canvasContainer = document.querySelector('.canvas-container') as HTMLElement;
    if (canvasContainer) {
      const canvasRect = canvasContainer.getBoundingClientRect();
      const canvasScale = getCanvasScale(canvasContainer);
      
      const elementPos = viewportToCanvasCoordinates(e.clientX, e.clientY, {
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
