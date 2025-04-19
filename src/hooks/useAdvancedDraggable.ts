
import { useRef, useEffect, useState } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { useMobile } from '@/context/MobileContext';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface DragCallbacks {
  onDragStart?: (element: HTMLElement, x: number, y: number, scale: number, rotation: number) => void;
  onDragMove?: (element: HTMLElement, x: number, y: number, scale: number, rotation: number) => void;
  onDragEnd?: (element: HTMLElement, x: number, y: number, scale: number, rotation: number) => void;
}

export const useAdvancedDraggable = (
  elementId: string,
  callbacks?: DragCallbacks
) => {
  const { 
    updateElementWithoutHistory, 
    commitToHistory, 
    elements, 
    isGameMode, 
    activeElement,
    setActiveElement
  } = useDesignState();
  
  const { isMobileDevice } = useMobile();
  const currentElement = elements.find(el => el.id === elementId);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  // References to track drag state
  const elementRef = useRef<HTMLDivElement | null>(null);
  const initialTouchRef = useRef<Position | null>(null);
  const initialPositionRef = useRef<Position | null>(null);
  const initialSizeRef = useRef<Size | null>(null);
  const initialScaleRef = useRef<number>(1);
  const initialRotationRef = useRef<number>(0);
  const initialDistanceRef = useRef<number>(0);
  const isActivelyDraggingRef = useRef<boolean>(false);
  const maxZIndexRef = useRef<number>(1000);
  
  // Track element state before drag
  const dragStartPositionRef = useRef<Position | null>(null);
  const dragStartSizeRef = useRef<Size | null>(null);
  const dragStartScaleRef = useRef<number>(1);
  const dragStartRotationRef = useRef<number>(0);
  
  // Canvas for pixel-perfect hit detection
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Set up canvas for hit detection
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvasRef.current = canvas;
    ctxRef.current = ctx;
    
    return () => {
      // Clean up
      canvasRef.current = null;
      ctxRef.current = null;
    };
  }, []);
  
  // Helper functions for transformation
  const getTransform = (el: HTMLElement) => {
    try {
      const style = window.getComputedStyle(el, null);
      const transform = style.getPropertyValue('transform') ||
                        style.getPropertyValue('-webkit-transform') ||
                        style.getPropertyValue('-moz-transform') ||
                        style.getPropertyValue('-ms-transform') ||
                        style.getPropertyValue('-o-transform') ||
                        'none';
      
      if (transform === 'none') return [1, 0, 0, 1, 0, 0];
      
      // matrix(a, b, c, d, tx, ty)
      const values = transform.split('(')[1].split(')')[0].split(',').map(v => parseFloat(v.trim()));
      return values;
    } catch (e) {
      console.error('Error getting transform:', e);
      return [1, 0, 0, 1, 0, 0];
    }
  };
  
  const getCurrentScale = (el: HTMLElement) => {
    const values = getTransform(el);
    // For a 2D matrix, the scale is calculated from the first 2 values
    return Math.sqrt(values[0] * values[0] + values[1] * values[1]);
  };
  
  const getCurrentRotation = (el: HTMLElement) => {
    const values = getTransform(el);
    // For a 2D matrix, rotation in radians is atan2(b, a)
    return Math.atan2(values[1], values[0]);
  };
  
  // Vector math helpers
  const addVectors = (a: Position, b: Position): Position => ({ 
    x: a.x + b.x, 
    y: a.y + b.y 
  });
  
  const subtractVectors = (a: Position, b: Position): Position => ({ 
    x: b.x - a.x, 
    y: b.y - a.y 
  });
  
  const scaleVector = (a: Position, s: number): Position => ({ 
    x: a.x * s, 
    y: a.y * s 
  });
  
  const magnitude = (a: Position): number => 
    Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
  
  const distance = (a: Position, b: Position): number => 
    magnitude(subtractVectors(a, b));
  
  const angle = (a: Position): number => 
    Math.atan2(a.y, a.x);
  
  // Check if a point in an image is transparent
  const checkPixelTransparency = (
    imgElement: HTMLImageElement, 
    x: number, 
    y: number
  ): boolean => {
    if (!canvasRef.current || !ctxRef.current) return false;
    
    // Set canvas to window size
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Get current element transform
    const scale = getCurrentScale(imgElement);
    const rotation = getCurrentRotation(imgElement);
    
    // Draw the image with its transformations
    const styles = window.getComputedStyle(imgElement);
    ctx.translate(parseFloat(styles.left), parseFloat(styles.top));
    ctx.scale(scale, scale);
    ctx.rotate(rotation);
    
    try {
      ctx.drawImage(
        imgElement,
        -imgElement.width / 2,
        -imgElement.height / 2,
        imgElement.width,
        imgElement.height
      );
    } catch (e) {
      console.error('Error drawing image to canvas:', e);
      return false;
    }
    
    ctx.resetTransform();
    
    // Check pixel alpha
    try {
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      return pixelData[3] === 0; // Alpha channel = 0 means transparent
    } catch (e) {
      console.warn('Error getting pixel data:', e);
      return false;
    }
  };
  
  // Find the top-most element at a point that supports dragging
  const findDraggableElementAtPoint = (
    event: TouchEvent | MouseEvent
  ): HTMLElement | null => {
    const touch = 'touches' in event ? event.touches[0] : event;
    const { clientX, clientY } = touch;
    
    const targetElement = document.elementFromPoint(clientX, clientY) as HTMLElement;
    if (!targetElement) return null;
    
    // If the element is an image, check pixel transparency
    if (
      targetElement.tagName === 'IMG' && 
      targetElement.classList.contains('canvas-element')
    ) {
      const isTransparent = checkPixelTransparency(
        targetElement as HTMLImageElement,
        clientX,
        clientY
      );
      
      if (isTransparent) {
        // Temporarily disable pointer events on this element
        targetElement.style.pointerEvents = 'none';
        const elementBeneath = document.elementFromPoint(clientX, clientY) as HTMLElement;
        targetElement.style.pointerEvents = '';
        
        if (elementBeneath && elementBeneath.classList.contains('canvas-element')) {
          return elementBeneath;
        }
      }
    }
    
    // Check if the element or its closest ancestor is draggable
    const draggableElement = targetElement.closest('.canvas-element') as HTMLElement;
    return draggableElement;
  };
  
  // Update the element in our state system
  const updateElementPosition = (
    id: string, 
    x: number, 
    y: number, 
    scale?: number, 
    rotation?: number
  ) => {
    if (!currentElement) return;
    
    const updates: any = {
      position: { x, y }
    };
    
    if (scale !== undefined) {
      updates.style = {
        ...currentElement.style,
        transform: `scale(${scale})${rotation !== undefined ? ` rotate(${rotation}deg)` : ''}`
      };
    } else if (rotation !== undefined) {
      const currentTransform = currentElement.style?.transform;
      
      // Fix TypeScript error by ensuring transform is a string before using includes/replace
      if (typeof currentTransform === 'string' && currentTransform.includes('scale')) {
        updates.style = {
          ...currentElement.style,
          transform: currentTransform.replace(/rotate\([^)]+\)/, `rotate(${rotation}deg)`)
        };
      } else {
        updates.style = {
          ...currentElement.style,
          transform: `rotate(${rotation}deg)`
        };
      }
    }
    
    updateElementWithoutHistory(id, updates);
  };
  
  // Start dragging
  const startDrag = (
    e: React.MouseEvent | React.TouchEvent, 
    elementPosition?: Position
  ) => {
    e.stopPropagation();
    
    // Don't start drag if this is an image in game mode with no interaction
    if (
      isGameMode && 
      currentElement?.type === 'image' && 
      !currentElement?.interaction?.type
    ) {
      return;
    }
    
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    element.style.zIndex = (maxZIndexRef.current + 100).toString(); // Bring to front during drag
    
    setActiveElement(currentElement!);
    setIsDragging(true);
    isActivelyDraggingRef.current = true;
    
    const touch = 'touches' in e 
      ? e.touches[0] 
      : (e as React.MouseEvent);
    
    // Store initial position and size
    const rect = element.getBoundingClientRect();
    const scale = getCurrentScale(element);
    const rotation = getCurrentRotation(element);
    
    initialTouchRef.current = { 
      x: touch.clientX, 
      y: touch.clientY 
    };
    
    initialPositionRef.current = elementPosition || { 
      x: currentElement!.position.x, 
      y: currentElement!.position.y 
    };
    
    initialSizeRef.current = {
      width: rect.width,
      height: rect.height
    };
    
    initialScaleRef.current = scale;
    initialRotationRef.current = rotation;
    
    // Store for drag callback
    dragStartPositionRef.current = { ...initialPositionRef.current };
    dragStartSizeRef.current = { ...initialSizeRef.current! };
    dragStartScaleRef.current = scale;
    dragStartRotationRef.current = rotation;
    
    // Call drag start callback
    if (callbacks?.onDragStart) {
      callbacks.onDragStart(
        element,
        initialPositionRef.current.x,
        initialPositionRef.current.y,
        scale,
        rotation * (180 / Math.PI) // Convert to degrees
      );
    }
    
    // Handle multi-touch for pinch/zoom/rotate
    if ('touches' in e && e.touches.length > 1) {
      const touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      
      const touchDiff = subtractVectors(touch1, touch2);
      const touchMid = addVectors(touch1, scaleVector(touchDiff, 0.5));
      
      initialDistanceRef.current = distance(touch1, touch2);
      initialRotationRef.current = angle(touchDiff) - getCurrentRotation(element);
      
      // Adjust offset based on midpoint
      initialTouchRef.current = {
        x: touchMid.x,
        y: touchMid.y
      };
    }
  };
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    
    if (!elementRef.current) return;
    
    setIsResizing(true);
    const element = elementRef.current;
    
    // Store initial state
    const rect = element.getBoundingClientRect();
    const scale = getCurrentScale(element);
    const rotation = getCurrentRotation(element);
    
    initialTouchRef.current = { 
      x: e.clientX, 
      y: e.clientY 
    };
    
    initialSizeRef.current = {
      width: rect.width,
      height: rect.height
    };
    
    initialScaleRef.current = scale;
    initialRotationRef.current = rotation;
    
    // Calculate initial distance for scale
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    initialDistanceRef.current = distance(
      { x: e.clientX, y: e.clientY },
      center
    );
    
    // Call drag start callback
    if (callbacks?.onDragStart) {
      callbacks.onDragStart(
        element,
        currentElement!.position.x,
        currentElement!.position.y,
        scale,
        rotation * (180 / Math.PI)
      );
    }
  };
  
  // Handle rotation start
  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!elementRef.current) return;
    
    setIsRotating(true);
    const element = elementRef.current;
    
    // Store initial state
    const rect = element.getBoundingClientRect();
    const scale = getCurrentScale(element);
    const rotation = getCurrentRotation(element);
    
    initialTouchRef.current = { 
      x: e.clientX, 
      y: e.clientY 
    };
    
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    // Calculate initial angle
    const touchVector = {
      x: e.clientX - center.x,
      y: e.clientY - center.y
    };
    
    initialRotationRef.current = angle(touchVector) - rotation;
    
    // Call drag start callback
    if (callbacks?.onDragStart) {
      callbacks.onDragStart(
        element,
        currentElement!.position.x,
        currentElement!.position.y,
        scale,
        rotation * (180 / Math.PI)
      );
    }
  };
  
  // Set up event listeners
  useEffect(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    
    // Create handler functions that have closure over our refs
    const handleMove = (clientX: number, clientY: number, isMultiTouch = false, secondTouch?: Position) => {
      if (!initialTouchRef.current || !initialPositionRef.current || !elementRef.current) return;
      
      const element = elementRef.current;
      
      // Default to single touch/mouse behavior
      let newX = initialPositionRef.current.x + (clientX - initialTouchRef.current.x);
      let newY = initialPositionRef.current.y + (clientY - initialTouchRef.current.y);
      let newScale = initialScaleRef.current;
      let newRotation = initialRotationRef.current;
      
      // Handle resize
      if (isResizing && initialSizeRef.current && initialDistanceRef.current) {
        const rect = element.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        
        const currentDistance = distance(
          { x: clientX, y: clientY },
          center
        );
        
        // Calculate scale change
        newScale = initialScaleRef.current * (currentDistance / initialDistanceRef.current);
        
        // Calculate rotation change if needed
        if (isRotating) {
          const touchVector = {
            x: clientX - center.x,
            y: clientY - center.y
          };
          
          newRotation = angle(touchVector) - initialRotationRef.current;
        }
      }
      // Handle rotation
      else if (isRotating && initialRotationRef.current !== null) {
        const rect = element.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        
        const touchVector = {
          x: clientX - center.x,
          y: clientY - center.y
        };
        
        newRotation = angle(touchVector) - initialRotationRef.current;
      }
      // Handle multi-touch (pinch/zoom/rotate)
      else if (isMultiTouch && secondTouch && initialDistanceRef.current) {
        const touch1 = { x: clientX, y: clientY };
        const touch2 = secondTouch;
        
        const touchDiff = subtractVectors(touch1, touch2);
        const touchMid = addVectors(touch1, scaleVector(touchDiff, 0.5));
        
        const currentDistance = distance(touch1, touch2);
        
        // Scale based on the change in distance between touches
        newScale = initialScaleRef.current * (currentDistance / initialDistanceRef.current);
        
        // Rotate based on the change in angle between touches
        newRotation = angle(touchDiff) - initialRotationRef.current;
        
        // Update position based on the midpoint
        newX = initialPositionRef.current.x + (touchMid.x - initialTouchRef.current.x);
        newY = initialPositionRef.current.y + (touchMid.y - initialTouchRef.current.y);
      }
      
      // Update position in context
      if (!isResizing && !isRotating) {
        updateElementPosition(
          elementId, 
          newX, 
          newY
        );
      }
      
      // Update transform properties if needed
      if ((isResizing || isRotating || isMultiTouch) && initialScaleRef.current !== null) {
        const rotationDegrees = newRotation * (180 / Math.PI);
        updateElementPosition(
          elementId,
          currentElement!.position.x,
          currentElement!.position.y,
          newScale,
          rotationDegrees
        );
      }
      
      // Call move callback
      if (callbacks?.onDragMove) {
        callbacks.onDragMove(
          element,
          newX,
          newY,
          newScale,
          newRotation * (180 / Math.PI)
        );
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isActivelyDraggingRef.current) return;
      
      e.preventDefault();
      
      // Handle multi-touch for pinch/zoom/rotate
      if (e.touches.length > 1) {
        const touch1 = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        
        const touch2 = {
          x: e.touches[1].clientX,
          y: e.touches[1].clientY
        };
        
        handleMove(touch1.x, touch1.y, true, touch2);
      } else if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing && !isRotating) return;
      
      handleMove(e.clientX, e.clientY);
    };
    
    const endDrag = () => {
      if (!elementRef.current || !isActivelyDraggingRef.current) return;
      
      const element = elementRef.current;
      
      // Reset active states
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      isActivelyDraggingRef.current = false;
      
      // Update z-index
      maxZIndexRef.current += 1;
      element.style.zIndex = maxZIndexRef.current.toString();
      
      // Commit changes to history
      commitToHistory();
      
      // Call end callback
      if (callbacks?.onDragEnd) {
        const scale = getCurrentScale(element);
        const rotation = getCurrentRotation(element);
        
        callbacks.onDragEnd(
          element,
          currentElement!.position.x,
          currentElement!.position.y,
          scale,
          rotation * (180 / Math.PI)
        );
      }
    };
    
    const handleTouchEnd = () => {
      endDrag();
    };
    
    const handleMouseUp = () => {
      endDrag();
    };
    
    // Add event listeners based on device type
    if (isMobileDevice) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      // Clean up event listeners
      if (isMobileDevice) {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [
    elementId, 
    isDragging, 
    isResizing, 
    isRotating, 
    updateElementWithoutHistory, 
    commitToHistory, 
    currentElement, 
    isMobileDevice,
    callbacks
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
