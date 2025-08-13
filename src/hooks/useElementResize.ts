import { useState, useEffect, useRef } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { getClientCoordinates } from "@/utils/coordinateUtils";

export const useElementResize = (element: DesignElement) => {
  const { 
    updateElement, 
    updateElementWithoutHistory, 
    commitToHistory, 
    startTemporaryOperation,
    setUserInteraction,
    setResizeMode
  } = useDesignState();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number | null>(null);
  
  // For smoother animations
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const isMobileRef = useRef<boolean>(false);
  const resizeStarted = useRef<boolean>(false);

  // Don't signal user interaction for resize operations to avoid affecting canvas zoom

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeMode(true); // Signal to context that we're resizing
    setStartPos({ x: e.clientX, y: e.clientY });
    
    const width = element.size?.width || 100;
    const height = element.size?.height || 100;
    
    setStartSize({
      width: Math.round(width),
      height: Math.round(height)
    });
    
    setStartPosition({
      x: Math.round(element.position.x),
      y: Math.round(element.position.y)
    });
    
    if (element.type === 'image') {
      setOriginalAspectRatio(width / height);
    } else {
      setOriginalAspectRatio(null);
    }
    
    // Detect if we're on mobile
    isMobileRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    resizeStarted.current = false;
    
    // Set will-change for better performance during resize
    updateElementWithoutHistory(element.id, {
      style: {
        ...element.style,
        willChange: 'width, height, transform'
      }
    });
  };

  const updateElementSize = (newWidth: number, newHeight: number, newX: number, newY: number, commit = false) => {
    if (!resizeStarted.current) {
      resizeStarted.current = true;
      startTemporaryOperation();
    }

    if (commit) {
      updateElement(element.id, {
        size: { 
          width: Math.round(newWidth), 
          height: Math.round(newHeight) 
        },
        position: { 
          x: Math.round(newX), 
          y: Math.round(newY) 
        },
        style: {
          ...element.style,
          willChange: 'auto'
        }
      });
    } else {
      // Use updateElementWithoutHistory during the resize for better performance
      updateElementWithoutHistory(element.id, {
        size: { 
          width: Math.round(newWidth), 
          height: Math.round(newHeight) 
        },
        position: { 
          x: Math.round(newX), 
          y: Math.round(newY) 
        }
      });
    }
  };

  // Improved vector-based resize calculation for more consistent and smooth corner resizing
  const calculateResizeVector = (
    deltaX: number,
    deltaY: number,
    direction: string,
    maintainAspectRatio: boolean
  ) => {
    // Initialize with start values
    let newWidth = startSize.width;
    let newHeight = startSize.height;
    let newX = startPosition.x;
    let newY = startPosition.y;
    
    // For aspect ratio preservation, always calculate both dimensions together
    if (maintainAspectRatio && originalAspectRatio) {
      // Determine proper scaling vector based on both deltas
      // Using vector magnitude to ensure consistent scaling
      let scaleVector = { x: 0, y: 0 };
      
      // Calculate the scaling factors for each dimension
      if (direction.includes('e')) {
        // Right side scaling
        scaleVector.x = (startSize.width + deltaX) / startSize.width;
      } else if (direction.includes('w')) {
        // Left side scaling
        scaleVector.x = (startSize.width - deltaX) / startSize.width;
      }
      
      if (direction.includes('s')) {
        // Bottom side scaling
        scaleVector.y = (startSize.height + deltaY) / startSize.height;
      } else if (direction.includes('n')) {
        // Top side scaling
        scaleVector.y = (startSize.height - deltaY) / startSize.height;
      }
      
      // For corners, use the larger scaling factor to determine final scaling
      let scaleFactor = 1;
      if (direction.length === 2) { // Corner resize
        // Use weighted average for more consistent corner scaling
        const weightX = Math.abs(deltaX) / (Math.abs(deltaX) + Math.abs(deltaY) + 0.001);
        const weightY = Math.abs(deltaY) / (Math.abs(deltaX) + Math.abs(deltaY) + 0.001);
        
        // Apply weighted average for smoother transitions
        scaleFactor = (scaleVector.x * weightX + scaleVector.y * weightY);
      } else {
        // Single edge - use the appropriate scale factor
        scaleFactor = direction.includes('e') || direction.includes('w') 
          ? scaleVector.x 
          : scaleVector.y;
      }
      
      // Ensure minimum size
      scaleFactor = Math.max(0.2, scaleFactor);
      
      // Calculate new dimensions
      newWidth = startSize.width * scaleFactor;
      newHeight = newWidth / originalAspectRatio;
      
      // Update position for handles that need it (w, n)
      if (direction.includes('w')) {
        newX = startPosition.x + (startSize.width - newWidth);
      }
      if (direction.includes('n')) {
        newY = startPosition.y + (startSize.height - newHeight);
      }
    } else {
      // Non-aspect ratio resize - apply deltas directly but with improved corner handling
      if (direction.length === 2) { // Corner resize
        // Process each dimension
        if (direction.includes('e')) {
          newWidth = Math.max(20, startSize.width + deltaX);
        } else if (direction.includes('w')) {
          newWidth = Math.max(20, startSize.width - deltaX);
          newX = startPosition.x + (startSize.width - newWidth);
        }
        
        if (direction.includes('s')) {
          newHeight = Math.max(20, startSize.height + deltaY);
        } else if (direction.includes('n')) {
          newHeight = Math.max(20, startSize.height - deltaY);
          newY = startPosition.y + (startSize.height - newHeight);
        }
      } else {
        // Edge resize handling
        switch (direction) {
          case 'e':
            newWidth = Math.max(20, startSize.width + deltaX);
            break;
          case 'w':
            newWidth = Math.max(20, startSize.width - deltaX);
            newX = startPosition.x + (startSize.width - newWidth);
            break;
          case 's':
            newHeight = Math.max(20, startSize.height + deltaY);
            break;
          case 'n':
            newHeight = Math.max(20, startSize.height - deltaY);
            newY = startPosition.y + (startSize.height - newHeight);
            break;
        }
      }
    }
    
    // Ensure size is positive and apply minimum size constraints
    newWidth = Math.max(20, newWidth);
    newHeight = Math.max(20, newHeight);
    
    return { newWidth, newHeight, newX, newY };
  };

  useEffect(() => {
    if (!isResizing || !resizeDirection) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        const coords = getClientCoordinates(e);
        
        const deltaX = coords.clientX - startPos.x;
        const deltaY = coords.clientY - startPos.y;
        
        const isImage = element.type === 'image';
        const maintainAspectRatio = isImage || originalAspectRatio !== null;
        
        // Use the improved vector-based resize calculation
        const { newWidth, newHeight, newX, newY } = calculateResizeVector(
          deltaX, 
          deltaY, 
          resizeDirection, 
          maintainAspectRatio
        );
        
        // Apply the changes
        updateElementSize(newWidth, newHeight, newX, newY);
      });
    };

    const handleEnd = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Commit the final state to history
      if (element.size && element.position) {
        setTimeout(() => {
          commitToHistory();
        }, 0);
      }
      
      setIsResizing(false);
      setResizeDirection(null);
      setResizeMode(false); // Signal to context that we're done resizing
      resizeStarted.current = false;
    };

    // Add both mouse and touch event listeners
    document.addEventListener("mousemove", handleMove, { passive: false });
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isResizing,
    startPos, 
    startSize,
    startPosition,
    resizeDirection, 
    element, 
    updateElement,
    originalAspectRatio,
    updateElementWithoutHistory,
    commitToHistory,
    startTemporaryOperation,
    setResizeMode
  ]);

  return {
    isResizing,
    handleResizeStart
  };
};
