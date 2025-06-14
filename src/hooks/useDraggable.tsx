import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { viewportToCanvasCoordinates, getCanvasScale, getClientCoordinates, preventDefaultTouchAction } from '@/utils/coordinateUtils';
import { useIsMobile } from './use-mobile';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { 
    updateElementWithoutHistory, 
    commitToHistory, 
    startTemporaryOperation,
    elements, 
    draggedInventoryItem, 
    handleItemCombination, 
    isGameMode 
  } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef<Position | null>(null);
  const elementInitialPos = useRef<Position | null>(null);
  const isDragStarted = useRef<boolean>(false);
  const animationFrame = useRef<number | null>(null);
  const mousePosition = useRef<Position>({ x: 0, y: 0 });
  const dragStartOffset = useRef<Position | null>(null);
  const isMobile = useIsMobile();
  const lastUpdateTime = useRef<number>(0);
  const velocity = useRef<Position>({ x: 0, y: 0 });
  const lastPosition = useRef<Position | null>(null);

  const currentElement = elements.find(el => el.id === elementId);
  
  const isPuzzleElement = currentElement?.type === 'puzzle';
  const isSequencePuzzleElement = currentElement?.type === 'sequencePuzzle';
  const isSliderPuzzleElement = currentElement?.type === 'sliderPuzzle';
  const isImageElement = currentElement?.type === 'image';

  useEffect(() => {
    if (!currentElement) return;
    
    const handleDragOver = (e: MouseEvent) => {
      if (draggedInventoryItem && currentElement.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
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
    
    const handleCustomDragOver = (e: CustomEvent) => {
      if (!draggedInventoryItem) return;
      
      const element = document.getElementById(`element-${elementId}`);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.detail.clientX;
      const y = e.detail.clientY;
      
      if (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom
      ) {
        if (currentElement.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
          element.classList.add('drop-target');
        }
      } else {
        element.classList.remove('drop-target');
      }
    };
    
    const handleCustomDrop = (e: CustomEvent) => {
      if (!draggedInventoryItem) return;
      
      const element = document.getElementById(`element-${elementId}`);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.detail.clientX;
      const y = e.detail.clientY;
      
      if (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom
      ) {
        if (currentElement.interaction?.canCombineWith?.includes(draggedInventoryItem.id)) {
          handleItemCombination(draggedInventoryItem.id, elementId);
        }
      }
      
      element.classList.remove('drop-target');
    };
    
    document.addEventListener('custom-drag-over', handleCustomDragOver as EventListener);
    document.addEventListener('custom-drop', handleCustomDrop as EventListener);
    
    return () => {
      document.removeEventListener('custom-drag-over', handleCustomDragOver as EventListener);
      document.removeEventListener('custom-drop', handleCustomDrop as EventListener);
    };
  }, [currentElement, draggedInventoryItem, elementId, handleItemCombination]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (
        !isDragging ||
        !startPosition.current ||
        !elementInitialPos.current ||
        !dragStartOffset.current
      )
        return;

      if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
        return;
      }

      e.preventDefault();
      updateElementPosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (
        !isDragging ||
        !startPosition.current ||
        !elementInitialPos.current ||
        !dragStartOffset.current ||
        !e.touches[0]
      )
        return;

      preventDefaultTouchAction(e);

      if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
        return;
      }

      const touch = e.touches[0];
      updateElementPosition(touch.clientX, touch.clientY);
    };

    const updateElementPosition = (clientX: number, clientY: number) => {
      const canvasContainer = document.querySelector('.canvas-container') as HTMLElement;
      if (!canvasContainer) return;

      const canvasRect = canvasContainer.getBoundingClientRect();
      const canvasScale = getCanvasScale(canvasContainer);

      const currentPos = viewportToCanvasCoordinates(clientX, clientY, {
        canvasScale,
        canvasRect,
      });

      mousePosition.current = { x: clientX, y: clientY };

      const startPos = viewportToCanvasCoordinates(startPosition.current!.x, startPosition.current!.y, {
        canvasScale,
        canvasRect,
      });

      if (!isDragStarted.current) {
        isDragStarted.current = true;
        startTemporaryOperation();
      }

      const now = performance.now();
      const elapsed = now - lastUpdateTime.current;
      
      if (lastPosition.current && elapsed > 0) {
        velocity.current = {
          x: (currentPos.x - lastPosition.current.x) / elapsed * 16.67,
          y: (currentPos.y - lastPosition.current.y) / elapsed * 16.67
        };
      }
      
      lastPosition.current = { x: currentPos.x, y: currentPos.y };
      lastUpdateTime.current = now;

      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(() => {
        const newX = elementInitialPos.current!.x + (currentPos.x - startPos.x);
        const newY = elementInitialPos.current!.y + (currentPos.y - startPos.y);

        updateElementWithoutHistory(elementId, {
          position: { x: newX, y: newY },
          style: {
            ...currentElement?.style,
            willChange: 'transform',
          },
        });
      });
    };

    const handleMouseUp = () => {
      endDrag();
    };

    const handleTouchEnd = () => {
      endDrag();
    };

    const endDrag = () => {
      setIsDragging(false);
      if (isDragStarted.current) {
        if (currentElement) {
          updateElementWithoutHistory(elementId, {
            style: {
              ...currentElement.style,
              willChange: 'auto',
              transition: 'none'
            },
          });
          
          if (isMobile && lastPosition.current && Math.abs(velocity.current.x) + Math.abs(velocity.current.y) > 0.5) {
            const momentumDistance = {
              x: velocity.current.x * 5,
              y: velocity.current.y * 5
            };
            
            const finalX = currentElement.position.x + momentumDistance.x;
            const finalY = currentElement.position.y + momentumDistance.y;
            
            updateElementWithoutHistory(elementId, {
              position: { x: finalX, y: finalY },
              style: {
                ...currentElement.style,
                transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              },
            });
          }
        }
        
        setTimeout(() => {
          commitToHistory();
        }, isMobile ? 300 : 0);
        
        isDragStarted.current = false;
      }
      
      startPosition.current = null;
      elementInitialPos.current = null;
      lastPosition.current = null;
      velocity.current = { x: 0, y: 0 };

      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);

      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [
    isDragging,
    elementId,
    updateElementWithoutHistory,
    commitToHistory,
    startTemporaryOperation,
    currentElement,
    isGameMode,
    isImageElement,
    isMobile
  ]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent, initialPosition: Position) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      return;
    }

    if (isImageElement || isPuzzleElement || isSliderPuzzleElement) {
      e.preventDefault();
    }

    e.stopPropagation();
    setIsDragging(true);

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    startPosition.current = { x: clientX, y: clientY };
    elementInitialPos.current = initialPosition;
    isDragStarted.current = false;
    lastUpdateTime.current = performance.now();
    velocity.current = { x: 0, y: 0 };
    lastPosition.current = null;

    const canvasContainer = document.querySelector('.canvas-container') as HTMLElement;
    if (canvasContainer) {
      const canvasRect = canvasContainer.getBoundingClientRect();
      const canvasScale = getCanvasScale(canvasContainer);

      const elementPos = viewportToCanvasCoordinates(clientX, clientY, {
        canvasScale,
        canvasRect,
      });

      dragStartOffset.current = {
        x: elementPos.x - initialPosition.x,
        y: elementPos.y - initialPosition.y,
      };
    }

    if (currentElement) {
      updateElementWithoutHistory(elementId, {
        style: {
          ...currentElement.style,
          willChange: 'transform',
          transition: 'none'
        },
      });
    }
  };

  return { startDrag, isDragging, currentElement, isMobile };
};
