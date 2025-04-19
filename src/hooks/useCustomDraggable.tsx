
import { useState, useEffect } from 'react';
import { useDesignState } from '@/context/DesignContext';

interface Position {
  x: number;
  y: number;
}

export const useCustomDraggable = (elementId: string) => {
  const { updateElementWithoutHistory, commitToHistory } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [elementOffset, setElementOffset] = useState<Position>({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    const element = document.getElementById(`element-${elementId}`);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setElementOffset({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
    
    setStartPos({ x: clientX, y: clientY });
    setIsDragging(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const newLeft = clientX - elementOffset.x;
    const newTop = clientY - elementOffset.y;

    updateElementWithoutHistory(elementId, {
      position: { x: newLeft, y: newTop }
    });
  };

  const handleEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      commitToHistory();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, elementId]);

  return {
    onMouseDown: (e: React.MouseEvent) => {
      if (e.button === 0) {
        handleStart(e.clientX, e.clientY);
      }
    },
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }
    },
    isDragging
  };
};
