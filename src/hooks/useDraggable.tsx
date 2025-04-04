
import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElement, elements } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const [localPosition, setLocalPosition] = useState<Position | null>(null);
  const startPosition = useRef<Position | null>(null);
  const elementInitialPos = useRef<Position | null>(null);

  // Get current element
  const element = elements.find(el => el.id === elementId);

  // Initialize local position from element
  useEffect(() => {
    if (element) {
      setLocalPosition({ x: element.position.x, y: element.position.y });
    }
  }, [element?.position.x, element?.position.y, element]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !startPosition.current || !elementInitialPos.current || !localPosition) return;

      const deltaX = e.clientX - startPosition.current.x;
      const deltaY = e.clientY - startPosition.current.y;

      const newX = elementInitialPos.current.x + deltaX;
      const newY = elementInitialPos.current.y + deltaY;

      // Update local position for smooth rendering
      setLocalPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging && localPosition) {
        // Update element position in the context
        updateElement(elementId, { 
          position: localPosition 
        });
      }
      
      setIsDragging(false);
      startPosition.current = null;
      elementInitialPos.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Add class to body to prevent text selection while dragging
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Reset body style
      document.body.style.userSelect = '';
    };
  }, [isDragging, elementId, updateElement, localPosition]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!element) return;
    
    setIsDragging(true);
    startPosition.current = { x: e.clientX, y: e.clientY };
    elementInitialPos.current = { x: element.position.x, y: element.position.y };
  };

  return { 
    startDrag, 
    isDragging, 
    position: localPosition || (element ? element.position : { x: 0, y: 0 })
  };
};
