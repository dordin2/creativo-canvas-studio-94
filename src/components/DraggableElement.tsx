import { useRef, useState, useEffect } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { useDraggable } from "@/hooks/useDraggable";

interface DraggableElementProps {
  element: DesignElement;
  isActive: boolean;
  children: React.ReactNode;
}

const DraggableElement = ({ element, isActive, children }: DraggableElementProps) => {
  const { updateElement } = useDesignState();
  const { startDrag, isDragging: isDraggingFromHook, currentElement } = useDraggable(element.id);
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startRotation, setStartRotation] = useState(0);
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    if (element.style && typeof element.style.transform === 'undefined') {
      updateElement(element.id, {
        style: { ...element.style, transform: "rotate(0deg)" }
      });
    }
  }, [element.id, element.style, updateElement]);

  const getRotation = (): number => {
    if (!element.style?.transform) return 0;
    const match = element.style.transform.toString().match(/rotate\((-?\d+)deg\)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    if (element.type === 'image' && 
        (e.target as HTMLElement).classList.contains('upload-placeholder-text')) {
      e.preventDefault();
    }
    
    startDrag(e, element.position);
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    
    const width = element.size?.width || 100;
    const height = element.size?.height || 100;
    
    setStartSize({
      width: width,
      height: height
    });
    
    if (element.type === 'image') {
      setOriginalAspectRatio(width / height);
    } else {
      setOriginalAspectRatio(null);
    }
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsRotating(true);
    setStartRotation(getRotation());
    
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setStartPos({ x: centerX, y: centerY });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        
        updateElement(element.id, {
          position: {
            x: element.position.x + deltaX,
            y: element.position.y + deltaY
          }
        });
        
        setStartPos({ x: e.clientX, y: e.clientY });
      } 
      else if (isResizing && resizeDirection) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        let newWidth = startSize.width;
        let newHeight = startSize.height;
        
        const shouldMaintainAspectRatio = element.type === 'image' && originalAspectRatio !== null;
        
        if (shouldMaintainAspectRatio) {
          if (resizeDirection.includes("e") || resizeDirection.includes("w")) {
            if (resizeDirection.includes("e")) {
              newWidth = Math.max(20, startSize.width + deltaX);
              newHeight = newWidth / originalAspectRatio;
            } else {
              newWidth = Math.max(20, startSize.width - deltaX);
              newHeight = newWidth / originalAspectRatio;
              
              if (newWidth !== startSize.width) {
                updateElement(element.id, {
                  position: {
                    x: element.position.x + (startSize.width - newWidth),
                    y: element.position.y
                  }
                });
              }
            }
          } else if (resizeDirection.includes("s") || resizeDirection.includes("n")) {
            if (resizeDirection.includes("s")) {
              newHeight = Math.max(20, startSize.height + deltaY);
              newWidth = newHeight * originalAspectRatio;
            } else {
              newHeight = Math.max(20, startSize.height - deltaY);
              newWidth = newHeight * originalAspectRatio;
              
              if (newHeight !== startSize.height) {
                updateElement(element.id, {
                  position: {
                    x: element.position.x,
                    y: element.position.y + (startSize.height - newHeight)
                  }
                });
              }
            }
          }
          
          if (resizeDirection === "se" || resizeDirection === "ne") {
            newWidth = Math.max(20, startSize.width + deltaX);
            newHeight = newWidth / originalAspectRatio;
            if (resizeDirection === "ne") {
              updateElement(element.id, {
                position: {
                  x: element.position.x,
                  y: element.position.y + (startSize.height - newHeight)
                }
              });
            }
          } else if (resizeDirection === "sw" || resizeDirection === "nw") {
            newWidth = Math.max(20, startSize.width - deltaX);
            newHeight = newWidth / originalAspectRatio;
            updateElement(element.id, {
              position: {
                x: element.position.x + (startSize.width - newWidth),
                y: element.position.y + (resizeDirection === "nw" ? (startSize.height - newHeight) : 0)
              }
            });
          }
        } else {
          if (resizeDirection.includes("e")) {
            newWidth = Math.max(20, startSize.width + deltaX);
          }
          if (resizeDirection.includes("w")) {
            newWidth = Math.max(20, startSize.width - deltaX);
            if (newWidth !== startSize.width) {
              updateElement(element.id, {
                position: {
                  x: element.position.x + (startSize.width - newWidth),
                  y: element.position.y
                }
              });
            }
          }
          if (resizeDirection.includes("s")) {
            newHeight = Math.max(20, startSize.height + deltaY);
          }
          if (resizeDirection.includes("n")) {
            newHeight = Math.max(20, startSize.height - deltaY);
            if (newHeight !== startSize.height) {
              updateElement(element.id, {
                position: {
                  x: element.position.x,
                  y: element.position.y + (startSize.height - newHeight)
                }
              });
            }
          }
        }
        
        updateElement(element.id, {
          size: { width: newWidth, height: newHeight }
        });
      } 
      else if (isRotating) {
        const centerX = startPos.x;
        const centerY = startPos.y;
        
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const rotation = angle + 90;
        
        const newStyle = { 
          ...element.style, 
          transform: `rotate(${rotation}deg)` 
        };
        
        updateElement(element.id, { style: newStyle });
      }
    };

    const handleMouseUp = () => {
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
    resizeDirection, 
    element, 
    updateElement,
    originalAspectRatio
  ]);

  const elementStyle = {
    ...element.style,
    position: 'absolute' as const,
    left: element.position.x,
    top: element.position.y,
    width: element.size?.width,
    height: element.size?.height,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: 'none',
    zIndex: element.layer,
  };

  const showResizeHandles = isActive && 
    !['heading', 'subheading', 'paragraph'].includes(element.type) &&
    element.type !== 'background';

  const showRotationHandle = isActive && element.type !== 'background';

  const elementDimensions = {
    width: element.size?.width || 0,
    height: element.size?.height || 0
  };

  const frameTransform = element.style?.transform || 'rotate(0deg)';

  return (
    <>
      <div
        ref={elementRef}
        className="canvas-element"
        style={elementStyle}
        onMouseDown={handleMouseDown}
        onDragOver={(e) => {
          if (element.type === 'image') {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {children}
      </div>

      {isActive && (
        <div className="element-controls-wrapper" style={{ pointerEvents: 'none' }}>
          <div
            className="element-frame"
            style={{
              left: element.position.x,
              top: element.position.y,
              width: elementDimensions.width,
              height: elementDimensions.height,
              transform: frameTransform,
              pointerEvents: 'none',
              zIndex: 1000 + element.layer,
            }}
          />
          
          <div 
            style={{
              position: 'absolute',
              left: element.position.x,
              top: element.position.y,
              width: elementDimensions.width,
              height: elementDimensions.height,
              transform: frameTransform,
              zIndex: 1000 + element.layer,
              pointerEvents: 'none',
            }}
          >
            {showResizeHandles && (
              <>
                <div 
                  className="resize-handle cursor-nw-resize"
                  style={{ top: -6, left: -6 }}
                  onMouseDown={(e) => handleResizeStart(e, "nw")}
                />
                <div 
                  className="resize-handle cursor-n-resize"
                  style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}
                  onMouseDown={(e) => handleResizeStart(e, "n")}
                />
                <div 
                  className="resize-handle cursor-ne-resize"
                  style={{ top: -6, right: -6 }}
                  onMouseDown={(e) => handleResizeStart(e, "ne")}
                />
                <div 
                  className="resize-handle cursor-e-resize"
                  style={{ top: '50%', right: -6, transform: 'translateY(-50%)' }}
                  onMouseDown={(e) => handleResizeStart(e, "e")}
                />
                <div 
                  className="resize-handle cursor-se-resize"
                  style={{ bottom: -6, right: -6 }}
                  onMouseDown={(e) => handleResizeStart(e, "se")}
                />
                <div 
                  className="resize-handle cursor-s-resize"
                  style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
                  onMouseDown={(e) => handleResizeStart(e, "s")}
                />
                <div 
                  className="resize-handle cursor-sw-resize"
                  style={{ bottom: -6, left: -6 }}
                  onMouseDown={(e) => handleResizeStart(e, "sw")}
                />
                <div 
                  className="resize-handle cursor-w-resize"
                  style={{ top: '50%', left: -6, transform: 'translateY(-50%)' }}
                  onMouseDown={(e) => handleResizeStart(e, "w")}
                />
              </>
            )}
            
            {showRotationHandle && (
              <div 
                className="rotation-handle"
                style={{ top: -40, left: '50%', transform: 'translateX(-50%)' }}
                onMouseDown={handleRotateStart}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 15C4 16.0609 4.42143 17.0783 5.17157 17.8284C5.92172 18.5786 6.93913 19 8 19H16C17.0609 19 18.0783 18.5786 18.8284 17.8284C19.5786 17.0783 20 16.0609 20 15V9C20 7.93913 19.5786 6.92172 18.8284 6.17157C18.0783 5.42143 17.0609 5 16 5H8C6.93913 5 5.92172 5.42143 5.17157 6.17157C4.42143 6.92172 4 7.93913 4 9" 
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3V7M9 5L12 8L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DraggableElement;
