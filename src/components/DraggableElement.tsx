
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
  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startRotation, setStartRotation] = useState(0);
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Array of text element types
  const textElementTypes = ['heading', 'subheading', 'paragraph'];

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
    
    // Don't start dragging if we're editing text
    if (isEditing) return;
    
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

  const handleTextDoubleClick = (e: React.MouseEvent) => {
    if (textElementTypes.includes(element.type)) {
      e.stopPropagation();
      setIsEditing(true);
      // Focus the text input after re-render
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 10);
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateElement(element.id, { content: e.target.value });
  };
  
  const handleTextBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      setIsEditing(false);
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
        
        const isImage = element.type === 'image';
        const maintainAspectRatio = isImage || originalAspectRatio !== null;
        
        // Use direct calculations based on direction instead of scale factor
        let newWidth = startSize.width;
        let newHeight = startSize.height;
        let newX = element.position.x;
        let newY = element.position.y;
        
        // Handle each direction with direct calculations
        if (resizeDirection.includes('e')) {
          // East/right edge - only width changes
          newWidth = Math.max(20, startSize.width + deltaX);
        }
        
        if (resizeDirection.includes('w')) {
          // West/left edge - width and x position change
          const widthChange = deltaX;
          newWidth = Math.max(20, startSize.width - widthChange);
          newX = element.position.x + (startSize.width - newWidth);
        }
        
        if (resizeDirection.includes('s')) {
          // South/bottom edge - only height changes
          newHeight = Math.max(20, startSize.height + deltaY);
        }
        
        if (resizeDirection.includes('n')) {
          // North/top edge - height and y position change
          const heightChange = deltaY;
          newHeight = Math.max(20, startSize.height - heightChange);
          newY = element.position.y + (startSize.height - newHeight);
        }
        
        // Maintain aspect ratio if needed
        if (maintainAspectRatio && originalAspectRatio) {
          if (resizeDirection.includes('e') || resizeDirection.includes('w')) {
            // Width was primary change, adjust height accordingly
            newHeight = newWidth / originalAspectRatio;
            
            // If north direction, adjust y position
            if (resizeDirection.includes('n')) {
              newY = element.position.y + (startSize.height - newHeight);
            }
          } else {
            // Height was primary change, adjust width accordingly
            newWidth = newHeight * originalAspectRatio;
            
            // If west direction, adjust x position
            if (resizeDirection.includes('w')) {
              newX = element.position.x + (startSize.width - newWidth);
            }
          }
        }
        
        // Update position if it changed
        if (newX !== element.position.x || newY !== element.position.y) {
          updateElement(element.id, {
            position: { x: newX, y: newY }
          });
        }
        
        // Update size
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

  // Show resize handles for all element types now
  const showResizeHandles = isActive && element.type !== 'background';

  const showRotationHandle = isActive && element.type !== 'background';

  const elementDimensions = {
    width: element.size?.width || 0,
    height: element.size?.height || 0
  };

  const frameTransform = element.style?.transform || 'rotate(0deg)';

  // Render different content for text elements when editing
  let childContent = children;
  if (isEditing && textElementTypes.includes(element.type)) {
    if (element.type === 'paragraph') {
      childContent = (
        <textarea
          ref={textInputRef as React.RefObject<HTMLTextAreaElement>}
          value={element.content || ''}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            resize: 'none',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: element.type === 'paragraph' ? '16px' : element.type === 'heading' ? '28px' : '20px',
            fontWeight: element.type === 'paragraph' ? 'normal' : element.type === 'heading' ? 'bold' : '600',
            color: element.style?.color as string,
            padding: '0',
            margin: '0',
            fontFamily: 'inherit',
            lineHeight: 'inherit',
            overflow: 'hidden'
          }}
          autoFocus
        />
      );
    } else {
      childContent = (
        <input
          ref={textInputRef as React.RefObject<HTMLInputElement>}
          type="text" 
          value={element.content || ''}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: element.type === 'heading' ? '28px' : '20px',
            fontWeight: element.type === 'heading' ? 'bold' : '600',
            color: element.style?.color as string,
            padding: '0',
            margin: '0',
            fontFamily: 'inherit'
          }}
          autoFocus
        />
      );
    }
  }

  return (
    <>
      <div
        ref={elementRef}
        className="canvas-element"
        style={elementStyle}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleTextDoubleClick}
        onDragOver={(e) => {
          if (element.type === 'image') {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {childContent}
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
                  className="resize-handle resize-handle-visible cursor-nw-resize"
                  style={{ top: -6, left: -6 }}
                  onMouseDown={(e) => handleResizeStart(e, "nw")}
                />
                <div 
                  className="resize-handle resize-handle-visible cursor-n-resize"
                  style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}
                  onMouseDown={(e) => handleResizeStart(e, "n")}
                />
                <div 
                  className="resize-handle resize-handle-visible cursor-ne-resize"
                  style={{ top: -6, right: -6 }}
                  onMouseDown={(e) => handleResizeStart(e, "ne")}
                />
                <div 
                  className="resize-handle resize-handle-visible cursor-e-resize"
                  style={{ top: '50%', right: -6, transform: 'translateY(-50%)' }}
                  onMouseDown={(e) => handleResizeStart(e, "e")}
                />
                <div 
                  className="resize-handle resize-handle-visible cursor-se-resize"
                  style={{ bottom: -6, right: -6 }}
                  onMouseDown={(e) => handleResizeStart(e, "se")}
                />
                <div 
                  className="resize-handle resize-handle-visible cursor-s-resize"
                  style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
                  onMouseDown={(e) => handleResizeStart(e, "s")}
                />
                <div 
                  className="resize-handle resize-handle-visible cursor-sw-resize"
                  style={{ bottom: -6, left: -6 }}
                  onMouseDown={(e) => handleResizeStart(e, "sw")}
                />
                <div 
                  className="resize-handle resize-handle-visible cursor-w-resize"
                  style={{ top: '50%', left: -6, transform: 'translateY(-50%)' }}
                  onMouseDown={(e) => handleResizeStart(e, "w")}
                />
              </>
            )}
            
            {showRotationHandle && (
              <div 
                className="rotation-handle rotation-handle-visible"
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
