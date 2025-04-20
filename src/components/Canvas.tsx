import { useRef, useEffect, useState, Fragment } from "react";
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
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainer.current) {
        const containerRect = canvasContainer.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        const baseWidth = 1600;
        const baseHeight = 900;
        const targetRatio = baseWidth / baseHeight;
        
        const padding = (!isGameMode && !isFullscreen) ? 48 : 0;
        const availableWidth = containerWidth - (padding * 2);
        const availableHeight = containerHeight - (padding * 2);
        
        const scaleX = availableWidth / baseWidth;
        const scaleY = availableHeight / baseHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const finalWidth = baseWidth * scale;
        const finalHeight = baseHeight * scale;
        
        setCanvasSize({ width: finalWidth, height: finalHeight });
        setCanvasScale(scale);
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
  }, [isGameMode, isFullscreen]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setActiveElement(null);
    }
  };
  
  const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
  
  const containerStyle = {
    position: 'relative' as const,
    overflow: 'hidden',
    width: canvasSize.width,
    height: canvasSize.height,
    aspectRatio: "16/9",
    zIndex: 1,
  };

  return (
    <Fragment>
      <div 
        ref={canvasContainer}
        className={cn(
          "relative w-full h-full bg-gray-100 flex items-center justify-center",
          isFullscreen ? "fixed inset-0 z-50" : "h-[calc(100vh-9rem)]",
          isMobileView && !isGameMode && "h-[calc(100vh-8rem)]",
        )}
      >
        <div
          className={cn(
            "canvas-container",
            isGameMode || isFullscreen ? "bg-transparent" : "bg-white shadow-lg",
            isMobileView && !isGameMode && !isFullscreen && "scale-100"
          )}
          style={containerStyle}
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
              canvasScale={canvasScale}
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
    </Fragment>
  );
};

export default Canvas;
