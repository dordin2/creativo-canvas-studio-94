import { useRef, useState, useCallback } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface Position {
  x: number;
  y: number;
}

interface DragCallbacks {
  onDragStart?: (element: HTMLElement, x: number, y: number, scale: number, rotation: number) => void;
  onDragMove?: (element: HTMLElement, x: number, y: number, scale: number, rotation: number) => void;
  onDragEnd?: (element: HTMLElement, x: number, y: number, scale: number, rotation: number) => void;
}

export const useAdvancedDraggable = (
  elementId: string, 
  canvasScale: number,
  callbacks?: DragCallbacks
) => {
  const { 
    updateElementWithoutHistory, 
    commitToHistory,
    elements,
    isGameMode
  } = useDesignState();
  
  const { isMobileDevice } = useMobile();
  const currentElement = elements.find(el => el.id === elementId);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  const elementRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<Position | null>(null);
  const elementStartRef = useRef<Position | null>(null);
  const rotationStartRef = useRef<number>(0);
  const isActivelyDraggingRef = useRef<boolean>(false);
  
  // Helper to map coordinates from screen to canvas space
  const toCanvasCoords = useCallback((clientX: number, clientY: number): Position => {
    if (!elementRef.current) return { x: 0, y: 0 };
    
    const rect = elementRef.current.getBoundingClientRect();
    const scaleX = rect.width / (rect.width * canvasScale);
    const scaleY = rect.height / (rect.height * canvasScale);
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, [canvasScale]);
  
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!elementRef.current || !currentElement) return;
    e.stopPropagation();
    
    setIsDragging(true);
    isActivelyDraggingRef.current = true;
    
    const touch = 'touches' in e 
      ? e.touches[0] 
      : (e as React.MouseEvent);
      
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    elementStartRef.current = { ...currentElement.position };
    
    if (callbacks?.onDragStart) {
      callbacks.onDragStart(
        elementRef.current,
        currentElement.position.x,
        currentElement.position.y,
        1,
        0
      );
    }
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !dragStartRef.current || !elementStartRef.current || !currentElement) return;
    
    const start = dragStartRef.current;
    const element = elementStartRef.current;
    
    const deltaX = (clientX - start.x) / canvasScale;
    const deltaY = (clientY - start.y) / canvasScale;
    
    const newX = element.x + deltaX;
    const newY = element.y + deltaY;
    
    requestAnimationFrame(() => {
      updateElementWithoutHistory(elementId, {
        position: { x: newX, y: newY }
      });
      
      if (callbacks?.onDragMove && elementRef.current) {
        callbacks.onDragMove(
          elementRef.current,
          newX,
          newY,
          1,
          0
        );
      }
    });
  }, [
    isDragging, 
    canvasScale, 
    elementId, 
    currentElement, 
    callbacks, 
    updateElementWithoutHistory
  ]);

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    
    if (!elementRef.current || !currentElement) return;
    
    isActivelyDraggingRef.current = true;
    
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    elementStartRef.current = { ...currentElement.position };
    
    // Store initial size and rotation for resize operation
    const rect = elementRef.current.getBoundingClientRect();
    const initialSize = {
      width: rect.width / canvasScale,
      height: rect.height / canvasScale
    };
    
    // We'll implement the actual resize logic in the move handler
    
    if (callbacks?.onDragStart) {
      callbacks.onDragStart(
        elementRef.current,
        currentElement.position.x,
        currentElement.position.y,
        1,
        0
      );
    }
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    
    if (!elementRef.current || !currentElement) return;
    
    isActivelyDraggingRef.current = true;
    
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    elementStartRef.current = { ...currentElement.position };
    
    // Calculate center of element
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate initial angle
    const initialAngle = Math.atan2(
      e.clientY - centerY,
      e.clientX - centerX
    );
    
    rotationStartRef.current = initialAngle;
    
    // We'll implement the actual rotation logic in the move handler
    
    if (callbacks?.onDragStart) {
      callbacks.onDragStart(
        elementRef.current,
        currentElement.position.x,
        currentElement.position.y,
        1,
        0
      );
    }
  };
  
  // Set up event handlers
  useEffect(() => {
    if (!elementRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isActivelyDraggingRef.current) return;
      handleMove(e.clientX, e.clientY);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isActivelyDraggingRef.current) return;
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    
    const endDrag = () => {
      if (!isActivelyDraggingRef.current) return;
      
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      isActivelyDraggingRef.current = false;
      
      commitToHistory();
      
      if (callbacks?.onDragEnd && elementRef.current && currentElement) {
        callbacks.onDragEnd(
          elementRef.current,
          currentElement.position.x,
          currentElement.position.y,
          1,
          0
        );
      }
    };
    
    if (isMobileDevice) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', endDrag);
      document.addEventListener('touchcancel', endDrag);
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', endDrag);
    }
    
    return () => {
      if (isMobileDevice) {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', endDrag);
        document.removeEventListener('touchcancel', endDrag);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', endDrag);
      }
    };
  }, [
    handleMove,
    commitToHistory,
    callbacks,
    currentElement,
    isMobileDevice
  ]);

  return {
    elementRef,
    isDragging,
    isResizing,
    isRotating,
    startDrag,
    handleResizeStart,
    handleRotateStart,
    currentElement
  };
};
