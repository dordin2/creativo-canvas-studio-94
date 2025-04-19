
import { useState, useCallback } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface Position {
  x: number;
  y: number;
}

interface DragState {
  offsetX: number;
  offsetY: number;
  currentX: number;
  currentY: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory, elements, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const { isMobileDevice } = useMobile();
  const currentElement = elements.find(el => el.id === elementId);
  
  const isImageElement = currentElement?.type === 'image';
  
  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragState) return;
    
    const element = document.getElementById(`element-${elementId}`);
    if (!element) return;

    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculate new position relative to the initial offset
    const newX = clientX - dragState.offsetX;
    const newY = clientY - dragState.offsetY;

    // Store the current position for handleEnd
    setDragState(prev => ({
      ...prev!,
      currentX: newX,
      currentY: newY
    }));

    // Update DOM position immediately for smooth dragging
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;

    // Update React state less frequently using requestAnimationFrame
    requestAnimationFrame(() => {
      updateElementWithoutHistory(elementId, {
        position: {
          x: newX,
          y: newY
        }
      });
    });
  }, [elementId, isDragging, dragState, updateElementWithoutHistory]);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isGameMode && isImageElement && !currentElement?.interaction?.type) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    
    const element = document.getElementById(`element-${elementId}`);
    if (!element) return;
    
    let clientX: number;
    let clientY: number;
    
    if ('touches' in e) {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = element.getBoundingClientRect();
    const currentX = rect.left;
    const currentY = rect.top;
    
    // Save the offset from mouse/touch to element's corner and current position
    setDragState({
      offsetX: clientX - currentX,
      offsetY: clientY - currentY,
      currentX: currentX,
      currentY: currentY
    });
    
    setIsDragging(true);
  }, [elementId, isGameMode, isImageElement, currentElement?.interaction?.type]);

  const handleEnd = useCallback(() => {
    if (!isDragging || !dragState) return;

    // Use the last known position from dragState instead of getting from DOM
    updateElementWithoutHistory(elementId, {
      position: { 
        x: dragState.currentX, 
        y: dragState.currentY 
      }
    });
    commitToHistory();

    setIsDragging(false);
    setDragState(null);
  }, [isDragging, dragState, elementId, updateElementWithoutHistory, commitToHistory]);

  return { startDrag, isDragging, currentElement, handleMove, handleEnd };
};
