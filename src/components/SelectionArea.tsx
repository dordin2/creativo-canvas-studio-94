
import { useState, useRef, useEffect } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { DesignElement } from '@/types/designTypes';

interface SelectionAreaProps {
  canvasRef: HTMLDivElement | null;
}

interface SelectionRect {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

const SelectionArea = ({ canvasRef }: SelectionAreaProps) => {
  const { elements, selectMultipleElements, clearSelection, isGameMode, selectedElementIds } = useDesignState();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const startPosRef = useRef<{ x: number, y: number } | null>(null);
  const selectionAreaRef = useRef<HTMLDivElement>(null);

  // Function to check if an element is within the selection area
  const isElementInSelectionArea = (element: DesignElement, rect: SelectionRect): boolean => {
    if (element.type === 'background' || element.isHidden) return false;

    const elementWidth = element.size?.width || 0;
    const elementHeight = element.size?.height || 0;
    
    // Element bounds
    const elementLeft = element.position.x;
    const elementTop = element.position.y;
    const elementRight = elementLeft + elementWidth;
    const elementBottom = elementTop + elementHeight;
    
    // Selection area bounds
    const selectionLeft = rect.startX;
    const selectionTop = rect.startY;
    const selectionRight = selectionLeft + rect.width;
    const selectionBottom = selectionTop + rect.height;
    
    // Check if the element is at least partially within the selection area
    return !(
      elementRight < selectionLeft ||
      elementLeft > selectionRight ||
      elementBottom < selectionTop ||
      elementTop > selectionBottom
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isGameMode) return;
    
    // Only start selection if it's a direct click on the canvas (not on an element)
    if (e.target !== canvasRef) return;
    
    // If holding Shift, don't clear the selection
    if (!e.shiftKey) {
      clearSelection();
    }
    
    const canvasRect = canvasRef?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const startX = e.clientX - canvasRect.left;
    const startY = e.clientY - canvasRect.top;
    
    startPosRef.current = { x: startX, y: startY };
    setSelectionRect({ startX, startY, width: 0, height: 0 });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSelecting || !canvasRef || !startPosRef.current) return;
    
    const canvasRect = canvasRef.getBoundingClientRect();
    const currentX = e.clientX - canvasRect.left;
    const currentY = e.clientY - canvasRect.top;
    
    // Calculate width and height
    const width = Math.abs(currentX - startPosRef.current.x);
    const height = Math.abs(currentY - startPosRef.current.y);
    
    // Calculate the correct top-left corner (in case user drags from right to left or bottom to top)
    const startX = Math.min(startPosRef.current.x, currentX);
    const startY = Math.min(startPosRef.current.y, currentY);
    
    setSelectionRect({ startX, startY, width, height });
  };

  const handleMouseUp = () => {
    if (!isSelecting || !selectionRect) {
      setIsSelecting(false);
      return;
    }
    
    // Find all elements that are within the selection area
    const newSelectedElements = elements.filter(element => 
      isElementInSelectionArea(element, selectionRect)
    );
    
    if (newSelectedElements.length > 0) {
      // Preserve existing selection if shift key was used
      if (selectedElementIds.length > 0) {
        const combinedSelection = [...selectedElementIds];
        
        // Add newly selected elements that aren't already selected
        newSelectedElements.forEach(element => {
          if (!selectedElementIds.includes(element.id)) {
            combinedSelection.push(element.id);
          }
        });
        
        selectMultipleElements(combinedSelection);
      } else {
        selectMultipleElements(newSelectedElements.map(el => el.id));
      }
    }
    
    setIsSelecting(false);
    setSelectionRect(null);
    startPosRef.current = null;
  };

  useEffect(() => {
    if (!canvasRef) return;
    
    canvasRef.addEventListener('mousedown', handleMouseDown as unknown as EventListener);
    
    return () => {
      canvasRef.removeEventListener('mousedown', handleMouseDown as unknown as EventListener);
    };
  }, [canvasRef, isGameMode]);

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, selectionRect, selectedElementIds]);

  if (!isSelecting || !selectionRect) return null;

  return (
    <div
      ref={selectionAreaRef}
      className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
      style={{
        top: `${selectionRect.startY}px`,
        left: `${selectionRect.startX}px`,
        width: `${selectionRect.width}px`,
        height: `${selectionRect.height}px`,
        zIndex: 1000,
      }}
    />
  );
};

export default SelectionArea;
