import { useRef, useEffect, useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import DraggableElement from "./DraggableElement";
import { Minus, Plus, RotateCcw, Maximize, Minimize } from "lucide-react";
import PuzzleElement from "./element/PuzzleElement";
import SequencePuzzleElement from "./element/SequencePuzzleElement";
import ClickSequencePuzzleElement from "./element/ClickSequencePuzzleElement";
import SliderPuzzleElement from "./element/SliderPuzzleElement";
import { Button } from "./ui/button";

interface CanvasProps {
  isFullscreen?: boolean;
  isMobileView?: boolean;
}

const Canvas = ({
  isFullscreen = false,
  isMobileView = false
}: CanvasProps) => {
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
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: FIXED_CANVAS_WIDTH,
    height: FIXED_CANVAS_HEIGHT
  });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState<number>(1);

  useEffect(() => {
    if (canvasRef === null && containerRef.current) {
      setCanvasRef(containerRef.current);
    }
  }, [canvasRef, setCanvasRef]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && parentRef.current) {
        const parentWidth = parentRef.current.clientWidth;
        const parentHeight = parentRef.current.clientHeight;
        const canvasWidth = FIXED_CANVAS_WIDTH;
        const canvasHeight = FIXED_CANVAS_HEIGHT;
        if (isMobileView && isGameMode) {
          const scaleX = parentWidth / canvasWidth;
          const scaleY = parentHeight / canvasHeight;
          const scale = Math.min(scaleX, scaleY);
          setZoomLevel(scale);
        } else {
          const scaleX = (parentWidth - 40) / canvasWidth;
          const scaleY = (parentHeight - 40) / canvasHeight;
          const scale = Math.min(scaleX, scaleY, 1);
          if (!isGameMode) {
            setZoomLevel(scale);
          }
        }
        setCanvasDimensions({
          width: canvasWidth,
          height: canvasHeight
        });
      }
    };
    handleResize();
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isGameMode, isMobileView]);

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

  const renderElements = () => {
    const sortedElements = [...elements].filter(element => element.type !== 'background').sort((a, b) => a.layer - b.layer);
    return sortedElements.map(element => {
      const isActive = activeElement?.id === element.id;
      switch (element.type) {
        case 'rectangle':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div className="h-full w-full" style={{
              backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
              borderRadius: element.style?.borderRadius || '4px'
            }} />
            </DraggableElement>;
        case 'circle':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div className="h-full w-full rounded-full" style={{
              backgroundColor: element.style?.backgroundColor as string || '#8B5CF6'
            }} />
            </DraggableElement>;
        case 'triangle':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div className="absolute" style={{
              width: 0,
              height: 0,
              borderLeft: `${element.size?.width || 50}px solid transparent`,
              borderRight: `${element.size?.width || 50}px solid transparent`,
              borderBottom: `${element.size?.height || 100}px solid ${element.style?.backgroundColor as string || '#8B5CF6'}`,
              backgroundColor: 'transparent'
            }} />
            </DraggableElement>;
        case 'line':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div className="h-full w-full" style={{
              backgroundColor: element.style?.backgroundColor as string || '#8B5CF6'
            }} />
            </DraggableElement>;
        case 'heading':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: element.style?.color as string || '#1F2937',
              margin: 0,
              width: '100%',
              height: '100%',
              cursor: 'text'
            }}>
                {element.content || 'Add a heading'}
              </h2>
            </DraggableElement>;
        case 'subheading':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: element.style?.color as string || '#1F2937',
              margin: 0,
              width: '100%',
              height: '100%',
              cursor: 'text'
            }}>
                {element.content || 'Add a subheading'}
              </h3>
            </DraggableElement>;
        case 'paragraph':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <p style={{
              fontSize: '16px',
              color: element.style?.color as string || '#1F2937',
              margin: 0,
              width: '100%',
              height: '100%',
              cursor: 'text',
              overflowWrap: 'break-word'
            }}>
                {element.content || 'Add your text here. Click to edit this text.'}
              </p>
            </DraggableElement>;
        case 'image':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div className="h-full w-full flex items-center justify-center overflow-hidden" onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
            }} onDrop={e => {
              e.preventDefault();
              e.stopPropagation();
              const files = e.dataTransfer.files;
              if (files.length > 0 && files[0].type.startsWith('image/')) {
                handleImageUpload(element.id, files[0]);
              }
            }}>
                {element.dataUrl ? <img src={element.dataUrl} alt="Uploaded content" className="w-full h-full" draggable={false} style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%'
              }} /> : element.src ? <img src={element.src} alt="Uploaded content" className="w-full h-full" draggable={false} style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%'
              }} /> : <div className="text-sm upload-placeholder-text text-gray-400 select-none w-full h-full flex items-center justify-center">
                    Click to upload image
                  </div>}
              </div>
            </DraggableElement>;
        case 'puzzle':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <PuzzleElement element={element} onClick={e => e.stopPropagation()} />
            </DraggableElement>;
        case 'sequencePuzzle':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <SequencePuzzleElement element={element} onClick={e => e.stopPropagation()} />
            </DraggableElement>;
        case 'clickSequencePuzzle':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <ClickSequencePuzzleElement element={element} onClick={e => e.stopPropagation()} />
            </DraggableElement>;
        case 'sliderPuzzle':
          return <DraggableElement key={element.id} element={element} isActive={isActive}>
              <SliderPuzzleElement element={element} onClick={e => e.stopPropagation()} />
            </DraggableElement>;
        default:
          return null;
      }
    });
  };

  const backgroundElement = elements.find(elem => elem.type === 'background');
  const backgroundStyle = backgroundElement ? {
    backgroundColor: backgroundElement.style?.backgroundColor as string || 'white',
    background: backgroundElement.style?.background as string || undefined
  } : {
    backgroundColor: 'white'
  };

  const calculateFullscreenScale = () => {
    if (!isFullscreen && !isGameMode) return zoomLevel;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    if (isMobileView) {
      const scaleX = viewportWidth / FIXED_CANVAS_WIDTH;
      const scaleY = viewportHeight / FIXED_CANVAS_HEIGHT;
      return Math.min(scaleX, scaleY);
    }
    const scaleX = viewportWidth / FIXED_CANVAS_WIDTH;
    const scaleY = viewportHeight / FIXED_CANVAS_HEIGHT;
    return Math.min(scaleX, scaleY);
  };

  const displayZoomLevel = (isFullscreen || isMobileView) && isGameMode ? calculateFullscreenScale() : zoomLevel;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.2));
  };

  const calculateTouchDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = calculateTouchDistance(e.touches[0], e.touches[1]);
      setInitialTouchDistance(distance);
      setInitialZoom(zoomLevel);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistance !== null) {
      const currentDistance = calculateTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialTouchDistance;
      const newZoom = Math.min(Math.max(initialZoom * scale, 0.2), 2);
      setZoomLevel(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setInitialTouchDistance(null);
  };

  useEffect(() => {
    if (isMobileView && containerRef.current) {
      const element = containerRef.current;
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchmove', handleTouchMove);
      element.addEventListener('touchend', handleTouchEnd);
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMobileView, initialTouchDistance, initialZoom]);

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY;
      const zoomFactor = 0.1;
      
      setZoomLevel(prev => {
        const newZoom = delta > 0 
          ? Math.max(prev - zoomFactor, 0.2) // Zoom out
          : Math.min(prev + zoomFactor, 2);  // Zoom in
        return newZoom;
      });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container && !isMobileView) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [isMobileView]);

  return <div ref={parentRef} className="flex-1 flex flex-col h-full relative">
      <div className={`flex-1 flex items-center justify-center ${isGameMode ? 'game-mode-workspace p-0 m-0' : 'canvas-workspace p-4'}`}>
        <div className={`canvas-container ${isGameMode ? 'game-mode-canvas-container' : ''}`} style={{
        transform: `scale(${displayZoomLevel})`,
        transformOrigin: 'center center',
        transition: isMobileView ? 'none' : 'transform 0.2s ease-out',
        position: 'absolute',
        top: '50%',
        left: '50%',
        translate: '-50% -50%',
        width: 'fit-content',
        height: 'fit-content',
        zIndex: 1
      }}>
          <div ref={containerRef} className={`relative shadow-lg rounded-lg ${!isGameMode && isDraggingOver ? 'ring-2 ring-primary' : ''}`} style={{
          width: `${canvasDimensions.width}px`,
          height: `${canvasDimensions.height}px`,
          ...backgroundStyle,
          overflow: 'hidden'
        }} onClick={handleCanvasClick} onDragOver={!isGameMode ? handleDragOver : undefined} onDragLeave={!isGameMode ? handleDragLeave : undefined} onDrop={!isGameMode ? handleDrop : undefined}>
            {renderElements()}
          </div>
        </div>
        
        {isGameMode && !isMobileView && <div className="fullscreen-controls">
            <button onClick={toggleFullscreen} title={isFullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"} className="fullscreen-button">
              {isFullscreenActive ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>}
        
        {!isGameMode && !isMobileView}
      </div>
    </div>;
};

export default Canvas;
