
import { useRef, useEffect, useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import DraggableElementWrapper from "./DraggableElementWrapper";
import { cn } from "@/lib/utils";
import useCanvasKeyboardShortcuts from "@/hooks/useCanvasKeyboardShortcuts";
import useCanvasDrop from "@/hooks/useCanvasDrop";
import { useMobile } from "@/context/MobileContext";
import { useInteractiveMode } from "@/context/InteractiveModeContext";

// Add global styles for draggable elements
const addGlobalStyles = () => {
  const styleId = 'canvas-draggable-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    body.dragging-inventory-item, 
    body.inventory-dragging,
    body.sequence-dragging {
      cursor: none !important;
    }
    
    .canvas-element {
      touch-action: none;
    }
    
    .drop-target {
      border: 2px dashed #8B5CF6 !important;
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.5) !important;
    }
    
    .game-mode-image {
      background-color: transparent !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }

    .inventory-item-preview, 
    #sequence-item-preview,
    #draggable-preview {
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      opacity: 0.9;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  `;
  
  document.head.appendChild(style);
};

interface CanvasProps {
  isFullscreen?: boolean;
  isMobileView?: boolean;
}

const Canvas = ({ isFullscreen = false, isMobileView = false }: CanvasProps) => {
  const { 
    elements, 
    canvasRef, 
    setCanvasRef, 
    activeElement,
    setActiveElement,
    isGameMode,
  } = useDesignState();
  const { isMobileDevice } = useMobile();
  const { isInteractiveMode } = useInteractiveMode();
  const { handleDrop, handleDragOver, handleDragLeave } = useCanvasDrop();
  useCanvasKeyboardShortcuts();
  
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasContainer = useRef<HTMLDivElement>(null);

  // Calculate canvas dimensions to maintain 16:9 ratio
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainer.current) {
        const containerRect = canvasContainer.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Calculate dimensions to fit 16:9 ratio
        const targetRatio = 16 / 9;
        let width = containerWidth - 48; // Add padding
        let height = width / targetRatio;
        
        // If height is too tall, calculate based on container height
        if (height > containerHeight - 48) {
          height = containerHeight - 48;
          width = height * targetRatio;
        }
        
        setCanvasSize({ width, height });
      }
    };
    
    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (canvasContainer.current) {
      resizeObserver.observe(canvasContainer.current);
    }
    
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      if (canvasContainer.current) {
        resizeObserver.unobserve(canvasContainer.current);
      }
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setActiveElement(null);
    }
  };
  
  const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
  
  return (
    <div 
      ref={canvasContainer}
      className={cn(
        "relative w-full h-full bg-gray-100 flex items-center justify-center p-6",
        isFullscreen ? "fixed inset-0 z-50" : "h-[calc(100vh-9rem)]",
        isMobileView && "h-[calc(100vh-8rem)]"
      )}
    >
      <div
        className={cn(
          "canvas-container relative overflow-visible bg-white shadow-lg",
          isFullscreen ? "w-full h-full" : "",
          isMobileView && !isFullscreen && "scale-[0.65]",
          isGameMode ? "bg-transparent" : "bg-white"
        )}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          aspectRatio: "16/9"
        }}
        ref={setCanvasRef}
        onClick={handleCanvasClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {sortedElements.map((element) => (
          <DraggableElementWrapper
            key={element.id}
            element={element}
            isActive={activeElement?.id === element.id}
          >
            {/* Render element content based on type */}
            {element.type === 'image' && element.dataUrl && (
              <img
                src={element.dataUrl}
                alt={element.alt || "Image"}
                className="w-full h-full object-contain"
                draggable={false}
              />
            )}
            {element.type === 'image' && !element.dataUrl && element.src && (
              <img
                src={element.src}
                alt={element.alt || "Image"}
                className="w-full h-full object-contain"
                draggable={false}
              />
            )}
            {element.type === 'image' && !element.dataUrl && !element.src && (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            )}
            {(element.type === 'heading' || element.type === 'subheading' || element.type === 'paragraph') && (
              <div>{element.text || ''}</div>
            )}
            {element.type === 'rectangle' && (
              <div className="w-full h-full" style={{ 
                backgroundColor: element.fill || 'rgba(59, 130, 246, 0.5)' 
              }}></div>
            )}
            {element.type === 'circle' && (
              <div className="w-full h-full rounded-full" style={{ 
                backgroundColor: element.fill || 'rgba(59, 130, 246, 0.5)' 
              }}></div>
            )}
            {(element.type === 'puzzle' || 
              element.type === 'sequencePuzzle' || 
              element.type === 'clickSequencePuzzle' || 
              element.type === 'sliderPuzzle') && (
              <div className="w-full h-full"></div>
            )}
          </DraggableElementWrapper>
        ))}
      </div>
    </div>
  );
};

export default Canvas;
