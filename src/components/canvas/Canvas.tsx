
import { useRef, useEffect, useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import DraggableElement from "../element/DraggableElement";
import { Minus, Plus, RotateCcw, Maximize, Minimize } from "lucide-react";
import { CanvasZoomControls } from "./CanvasZoomControls";
import { CanvasFullscreenControl } from "./CanvasFullscreenControl";
import { useCanvasScaling } from "@/hooks/canvas/useCanvasScaling";
import { renderCanvasElements } from "@/utils/canvas/canvasRenderer";

interface CanvasProps {
  isFullscreen?: boolean;
  isMobileView?: boolean;
}

const Canvas = ({ isFullscreen = false, isMobileView = false }: CanvasProps) => {
  const { 
    canvasRef, 
    setCanvasRef, 
    elements, 
    activeElement, 
    setActiveElement,
    handleImageUpload,
    isGameMode
  } = useDesignState();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const FIXED_CANVAS_WIDTH = 1600;
  const FIXED_CANVAS_HEIGHT = 900;
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);

  const { 
    zoomLevel, 
    setZoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    displayZoomLevel,
    canvasDimensions
  } = useCanvasScaling({
    containerRef,
    parentRef,
    isGameMode,
    isMobileView,
    isFullscreen,
    fixedWidth: FIXED_CANVAS_WIDTH,
    fixedHeight: FIXED_CANVAS_HEIGHT
  });

  useEffect(() => {
    if (canvasRef === null && containerRef.current) {
      setCanvasRef(containerRef.current);
    }
  }, [canvasRef, setCanvasRef]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreenActive(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current && !isGameMode) {
      setActiveElement(null);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isGameMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = () => {
    if (isGameMode) return;
    
    setIsDraggingOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isGameMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      if (activeElement && activeElement.type === 'image') {
        handleImageUpload(activeElement.id, files[0]);
      } else {
        const newElement = useDesignState().addElement('image');
        setTimeout(() => {
          handleImageUpload(newElement.id, files[0]);
        }, 100);
      }
    }
  };
  
  const backgroundElement = elements.find(elem => elem.type === 'background');
  const backgroundStyle = backgroundElement ? {
    backgroundColor: backgroundElement.style?.backgroundColor as string || 'white',
    background: backgroundElement.style?.background as string || undefined
  } : { backgroundColor: 'white' };
  
  return (
    <div ref={parentRef} className="flex-1 flex flex-col h-full relative">
      <div className={`flex-1 flex items-center justify-center ${isGameMode ? 'game-mode-workspace p-0 m-0' : 'canvas-workspace p-4'}`}>
        <div className={`canvas-container ${isGameMode ? 'game-mode-canvas-container' : ''}`} style={{ 
          transform: `scale(${displayZoomLevel})`, 
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out',
          position: 'absolute',
          top: '50%',
          left: '50%',
          translate: '-50% -50%',
          width: 'fit-content',
          height: 'fit-content',
          zIndex: 1
        }}>
          <div
            ref={containerRef}
            className={`relative shadow-lg rounded-lg ${!isGameMode && isDraggingOver ? 'ring-2 ring-primary' : ''}`}
            style={{
              width: `${canvasDimensions.width}px`,
              height: `${canvasDimensions.height}px`,
              ...backgroundStyle,
              overflow: 'hidden'
            }}
            onClick={handleCanvasClick}
            onDragOver={!isGameMode ? handleDragOver : undefined}
            onDragLeave={!isGameMode ? handleDragLeave : undefined}
            onDrop={!isGameMode ? handleDrop : undefined}
          >
            {renderCanvasElements(elements, activeElement)}
          </div>
        </div>
        
        {!isGameMode && (
          <CanvasZoomControls 
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
          />
        )}
        
        {isGameMode && !isMobileView && (
          <CanvasFullscreenControl 
            isFullscreenActive={isFullscreenActive}
            onToggleFullscreen={toggleFullscreen}
          />
        )}
      </div>
    </div>
  );
};

export default Canvas;
