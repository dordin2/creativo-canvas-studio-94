
import { useState, useEffect, useRef } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (elementId: string) => {
  const { updateElement } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const startPosition = useRef<Position | null>(null);
  const elementInitialPos = useRef<Position | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !startPosition.current || !elementInitialPos.current) return;

      const deltaX = e.clientX - startPosition.current.x;
      const deltaY = e.clientY - startPosition.current.y;

      const newX = elementInitialPos.current.x + deltaX;
      const newY = elementInitialPos.current.y + deltaY;

      updateElement(elementId, { 
        position: { x: newX, y: newY } 
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      startPosition.current = null;
      elementInitialPos.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, elementId, updateElement]);

  const startDrag = (e: React.MouseEvent, initialPosition: Position) => {
    e.stopPropagation();
    setIsDragging(true);
    startPosition.current = { x: e.clientX, y: e.clientY };
    elementInitialPos.current = initialPosition;
  };

  return { startDrag, isDragging };
};
