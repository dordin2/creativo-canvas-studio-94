import { useRef, useEffect, useState, useCallback } from "react";
import { useDesignState } from "@/context/DesignContext";
import DraggableElementWrapper from "./DraggableElementWrapper";
import { cn } from "@/lib/utils";
import useCanvasKeyboardShortcuts from "@/hooks/useCanvasKeyboardShortcuts";
import useCanvasDrop from "@/hooks/useCanvasDrop";
import { useMobile } from "@/context/MobileContext";
import { useInteractiveMode } from "@/context/InteractiveModeContext";

interface CanvasProps {
  isFullscreen?: boolean;
  isMobileView?: boolean;
}

// Base canvas dimensions (16:9 aspect ratio)
const BASE_WIDTH = 1600;
const BASE_HEIGHT = 900;

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
  
  const [scale, setScale] = useState(1);
  const canvasContainer = useRef<HTMLDivElement>(null);

  const updateCanvasScale = useCallback(() => {
    if (!canvasContainer.current) return;
    
    const containerRect = canvasContainer.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Calculate scale to fit container while maintaining aspect ratio
    const scaleX = (containerWidth - (isGameMode ? 0 : 48)) / BASE_WIDTH;
    const scaleY = (containerHeight - (isGameMode ? 0 : 48)) / BASE_HEIGHT;
    const newScale = Math.min(scaleX, scaleY);
    
    setScale(newScale);
  }, [isGameMode]);
  
  useEffect(() => {
    updateCanvasScale();
    
    const resizeObserver = new ResizeObserver(updateCanvasScale);
    if (canvasContainer.current) {
      resizeObserver.observe(canvasContainer.current);
    }
    
    window.addEventListener('resize', updateCanvasScale);
    
    return () => {
      if (canvasContainer.current) {
        resizeObserver.unobserve(canvasContainer.current);
      }
      window.removeEventListener('resize', updateCanvasScale);
    };
  }, [updateCanvasScale]);

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
        "relative w-full h-full bg-gray-100 flex items-center justify-center",
        isFullscreen ? "fixed inset-0 z-50" : "h-[calc(100vh-9rem)]",
        isMobileView && !isGameMode && "h-[calc(100vh-8rem)]",
        isGameMode && "p-0"
      )}
    >
      <div
        className={cn(
          "canvas-container overflow-hidden",
          isGameMode ? "bg-transparent" : "bg-white shadow-lg",
          isMobileView && !isGameMode && !isFullscreen && "scale-100"
        )}
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center'
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
            canvasScale={scale}
          >
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
