
import { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";

interface DraggableElementProps {
  element: DesignElement;
  isActive: boolean;
  children: React.ReactNode;
}

const DraggableElement = ({ element, isActive, children }: DraggableElementProps) => {
  const { updateElement } = useDesignState();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startRotation, setStartRotation] = useState(0);
  
  // Local state for smoother updates
  const [localPosition, setLocalPosition] = useState({ x: element.position.x, y: element.position.y });
  const [localSize, setLocalSize] = useState({ 
    width: element.size?.width || 100, 
    height: element.size?.height || 100 
  });
  const [localRotation, setLocalRotation] = useState(getRotation());

  // Sync local state with element props when they change from outside
  useEffect(() => {
    setLocalPosition({ x: element.position.x, y: element.position.y });
    setLocalSize({ 
      width: element.size?.width || 100, 
      height: element.size?.height || 100 
    });
    setLocalRotation(getRotation());
  }, [element.position.x, element.position.y, element.size?.width, element.size?.height, element.style?.transform]);

  // Initialize rotation if it doesn't exist
  useEffect(() => {
    if (element.style && typeof element.style.transform === 'undefined') {
      updateElement(element.id, {
        style: { ...element.style, transform: "rotate(0deg)" }
      });
    }
  }, [element.id, element.style, updateElement]);

  // Get rotation value from transform style
  function getRotation(): number {
    if (!element.style?.transform) return 0;
    const match = element.style.transform.toString().match(/rotate\((-?\d+)deg\)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left-click
    e.stopPropagation();
    
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  // Start resizing
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ ...localSize });
  };

  // Start rotation
  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsRotating(true);
    setStartRotation(localRotation);
    
    // Calculate center of element
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setStartPos({ x: centerX, y: centerY });
    }
  };

  // Handle mouse move for all operations
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        
        // Update local position for immediate visual feedback
        setLocalPosition({
          x: localPosition.x + deltaX,
          y: localPosition.y + deltaY
        });
        
        // Set new start position for next move calculation
        setStartPos({ x: e.clientX, y: e.clientY });
      } 
      else if (isResizing && resizeDirection) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        let newWidth = startSize.width;
        let newHeight = startSize.height;
        let newX = localPosition.x;
        let newY = localPosition.y;
        
        // Handle different resize directions
        if (resizeDirection.includes("e")) {
          newWidth = Math.max(20, startSize.width + deltaX);
        }
        if (resizeDirection.includes("w")) {
          newWidth = Math.max(20, startSize.width - deltaX);
          if (newWidth !== startSize.width) {
            newX = localPosition.x + (startSize.width - newWidth);
          }
        }
        if (resizeDirection.includes("s")) {
          newHeight = Math.max(20, startSize.height + deltaY);
        }
        if (resizeDirection.includes("n")) {
          newHeight = Math.max(20, startSize.height - deltaY);
          if (newHeight !== startSize.height) {
            newY = localPosition.y + (startSize.height - newHeight);
          }
        }
        
        // Update local state for immediate visual feedback
        setLocalSize({ width: newWidth, height: newHeight });
        setLocalPosition({ x: newX, y: newY });
      } 
      else if (isRotating) {
        // Calculate angle between center and current mouse position
        const centerX = startPos.x;
        const centerY = startPos.y;
        
        // Math to calculate angle
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const rotation = Math.round(angle + 90); // Adjust to make it intuitive and round to nearest integer
        
        // Update local rotation for immediate visual feedback
        setLocalRotation(rotation);
      }
    };

    const handleMouseUp = () => {
      // On mouse up, update the actual element state with our local values
      if (isDragging) {
        updateElement(element.id, { position: localPosition });
      }
      
      if (isResizing) {
        updateElement(element.id, {
          size: localSize,
          position: localPosition
        });
      }
      
      if (isRotating) {
        updateElement(element.id, { 
          style: { 
            ...element.style, 
            transform: `rotate(${localRotation}deg)` 
          } 
        });
      }
      
      // Reset interaction states
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging, 
    isResizing,
    isRotating,
    startPos, 
    startSize,
    startRotation,
    localPosition,
    localSize,
    localRotation,
    resizeDirection, 
    element.id, 
    element.style,
    updateElement
  ]);

  // Build the style for the element using local state for smoother updates
  const elementStyle = {
    ...element.style,
    position: 'absolute' as const,
    left: `${localPosition.x}px`,
    top: `${localPosition.y}px`,
    width: `${localSize.width}px`,
    height: `${localSize.height}px`,
    transform: `rotate(${localRotation}deg)`,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: isActive ? '1px solid #8B5CF6' : 'none',
    transition: 'none', // Disable transitions for smoother manual transforms
    willChange: (isDragging || isResizing || isRotating) ? 'transform, left, top, width, height' : 'auto',
  };

  // Don't show resize handles for text elements
  const showResizeHandles = isActive && 
    !['heading', 'subheading', 'paragraph'].includes(element.type) &&
    element.type !== 'background';

  // Don't show rotation handle for background
  const showRotationHandle = isActive && element.type !== 'background';

  return (
    <div
      ref={elementRef}
      className={`canvas-element ${isDragging ? 'dragging' : ''}`}
      style={elementStyle}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* Resize handles */}
      {showResizeHandles && (
        <>
          <div 
            className="absolute w-3 h-3 bg-canvas-purple rounded-full cursor-nw-resize -top-1.5 -left-1.5 z-10"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div 
            className="absolute w-3 h-3 bg-canvas-purple rounded-full cursor-n-resize top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div 
            className="absolute w-3 h-3 bg-canvas-purple rounded-full cursor-ne-resize -top-1.5 -right-1.5 z-10"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div 
            className="absolute w-3 h-3 bg-canvas-purple rounded-full cursor-e-resize top-1/2 -right-1.5 -translate-y-1/2 z-10"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
          <div 
            className="absolute w-3 h-3 bg-canvas-purple rounded-full cursor-se-resize -bottom-1.5 -right-1.5 z-10"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div 
            className="absolute w-3 h-3 bg-canvas-purple rounded-full cursor-s-resize bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div 
            className="absolute w-3 h-3 bg-canvas-purple rounded-full cursor-sw-resize -bottom-1.5 -left-1.5 z-10"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div 
            className="absolute w-3 h-3 bg-canvas-purple rounded-full cursor-w-resize top-1/2 -left-1.5 -translate-y-1/2 z-10"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
        </>
      )}
      
      {/* Rotation handle */}
      {showRotationHandle && (
        <div 
          className="absolute w-5 h-5 rounded-full bg-canvas-purple flex items-center justify-center cursor-move top-0 left-1/2 -translate-x-1/2 -translate-y-8"
          onMouseDown={handleRotateStart}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 15C4 16.0609 4.42143 17.0783 5.17157 17.8284C5.92172 18.5786 6.93913 19 8 19H16C17.0609 19 18.0783 18.5786 18.8284 17.8284C19.5786 17.0783 20 16.0609 20 15V9C20 7.93913 19.5786 6.92172 18.8284 6.17157C18.0783 5.42143 17.0609 5 16 5H8C6.93913 5 5.92172 5.42143 5.17157 6.17157C4.42143 6.92172 4 7.93913 4 9" 
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3V7M9 5L12 8L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default DraggableElement;
