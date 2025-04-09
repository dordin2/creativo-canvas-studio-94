import { useRef, useEffect, useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import DraggableElement from "./DraggableElement";
import LayersList from "./LayersList";
import { Minus, Plus, RotateCcw, Maximize, Minimize } from "lucide-react";
import PuzzleElement from "./element/PuzzleElement";
import SequencePuzzleElement from "./element/SequencePuzzleElement";
import ClickSequencePuzzleElement from "./element/ClickSequencePuzzleElement";
import SliderPuzzleElement from "./element/SliderPuzzleElement";
import InventoryIcon from "./inventory/InventoryIcon";

interface CanvasProps {
  isFullscreenActive?: boolean;
}

const Canvas = ({ isFullscreenActive = false }: CanvasProps) => {
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
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1600, height: 900 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(isFullscreenActive);
  
  // Adjust fullscreen game zoom to 1.8 based on observed behavior
  const fullscreenGameZoom = 1.8;

  useEffect(() => {
    if (canvasRef === null && containerRef.current) {
      setCanvasRef(containerRef.current);
    }
  }, [canvasRef, setCanvasRef]);
  
  // Update isFullscreen state when prop changes
  useEffect(() => {
    setIsFullscreen(isFullscreenActive);
    
    // Apply the adjusted zoom level when entering fullscreen game mode
    if (isFullscreenActive && isGameMode) {
      setZoomLevel(fullscreenGameZoom);
    } else if (!isFullscreenActive && isGameMode) {
      // Reset to normal zoom when exiting fullscreen in game mode
      setZoomLevel(1);
    }
  }, [isFullscreenActive, isGameMode]);
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && parentRef.current) {
        // If in fullscreen game mode, fill the entire screen
        if (isFullscreen && isGameMode) {
          const screenWidth = window.innerWidth;
          const screenHeight = window.innerHeight;
          
          setCanvasDimensions({ 
            width: screenWidth, 
            height: screenHeight 
          });
          return;
        }
        
        const parentWidth = parentRef.current.clientWidth;
        const parentHeight = parentRef.current.clientHeight;
        
        const minWidth = 1600;
        const minHeight = 900;
        
        const maxWidth = Math.max(minWidth, parentWidth - 20);
        const maxHeight = Math.max(minHeight, parentHeight - 40);
        
        const aspectRatio = 16/9;
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
        
        setCanvasDimensions({ width, height });
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
  }, [isGameMode, isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Detect fullscreen change from browser controls
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        // Reset zoom level when exiting fullscreen in game mode
        if (isGameMode) {
          setZoomLevel(1);
        }
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, isGameMode]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (parentRef.current?.requestFullscreen) {
        parentRef.current.requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
            // Apply updated zoom when entering fullscreen in game mode
            if (isGameMode) {
              setZoomLevel(fullscreenGameZoom);
            }
          })
          .catch(err => console.error("Error attempting to enable fullscreen:", err));
      }
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
          // Reset zoom level when exiting fullscreen in game mode
          if (isGameMode) {
            setZoomLevel(1);
          }
        })
        .catch(err => console.error("Error attempting to exit fullscreen:", err));
    }
  };
  
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };
  
  const handleResetZoom = () => {
    setZoomLevel(1);
  };
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current && !isGameMode) {
      setActiveElement(null);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isGameMode) return; // No dragging in game mode
    
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = () => {
    if (isGameMode) return;
    
    setIsDraggingOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isGameMode) return; // No dropping in game mode
    
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
    const sortedElements = [...elements]
      .filter(element => element.type !== 'background')
      .sort((a, b) => a.layer - b.layer);
    
    return sortedElements.map((element) => {
      const isActive = activeElement?.id === element.id;
      
      const elementToRender = isFullscreen && isGameMode 
        ? {
            ...element,
            // No need to modify positions here as we're using CSS transforms for scaling
          } 
        : element;
      
      switch (elementToRender.type) {
        case 'rectangle':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <div
                className="h-full w-full"
                style={{
                  backgroundColor: elementToRender.style?.backgroundColor as string || '#8B5CF6',
                  borderRadius: elementToRender.style?.borderRadius || '4px'
                }}
              />
            </DraggableElement>
          );
          
        case 'circle':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <div
                className="h-full w-full rounded-full"
                style={{
                  backgroundColor: elementToRender.style?.backgroundColor as string || '#8B5CF6'
                }}
              />
            </DraggableElement>
          );
          
        case 'triangle':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <div
                className="absolute"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${(elementToRender.size?.width || 50)}px solid transparent`,
                  borderRight: `${(elementToRender.size?.width || 50)}px solid transparent`,
                  borderBottom: `${(elementToRender.size?.height || 100)}px solid ${elementToRender.style?.backgroundColor as string || '#8B5CF6'}`,
                  backgroundColor: 'transparent'
                }}
              />
            </DraggableElement>
          );
          
        case 'line':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <div
                className="h-full w-full"
                style={{
                  backgroundColor: elementToRender.style?.backgroundColor as string || '#8B5CF6'
                }}
              />
            </DraggableElement>
          );
          
        case 'heading':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <h2 
                style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold',
                  color: elementToRender.style?.color as string || '#1F2937',
                  margin: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'text'
                }}
              >
                {elementToRender.content || 'Add a heading'}
              </h2>
            </DraggableElement>
          );
          
        case 'subheading':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <h3 
                style={{ 
                  fontSize: '20px', 
                  fontWeight: '600',
                  color: elementToRender.style?.color as string || '#1F2937',
                  margin: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'text'
                }}
              >
                {elementToRender.content || 'Add a subheading'}
              </h3>
            </DraggableElement>
          );
          
        case 'paragraph':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <p 
                style={{ 
                  fontSize: '16px',
                  color: elementToRender.style?.color as string || '#1F2937',
                  margin: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'text',
                  overflowWrap: 'break-word'
                }}
              >
                {elementToRender.content || 'Add your text here. Click to edit this text.'}
              </p>
            </DraggableElement>
          );
          
        case 'image':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <div
                className="h-full w-full flex items-center justify-center overflow-hidden"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const files = e.dataTransfer.files;
                  if (files.length > 0 && files[0].type.startsWith('image/')) {
                    handleImageUpload(elementToRender.id, files[0]);
                  }
                }}
              >
                {elementToRender.dataUrl ? (
                  <img 
                    src={elementToRender.dataUrl} 
                    alt="Uploaded content" 
                    className="w-full h-full" 
                    draggable={false}
                    style={{ 
                      objectFit: 'contain', 
                      width: '100%', 
                      height: '100%'
                    }}
                  />
                ) : elementToRender.src ? (
                  <img 
                    src={elementToRender.src} 
                    alt="Uploaded content" 
                    className="w-full h-full" 
                    draggable={false}
                    style={{ 
                      objectFit: 'contain', 
                      width: '100%', 
                      height: '100%'
                    }}
                  />
                ) : (
                  <div className="text-sm upload-placeholder-text text-gray-400 select-none w-full h-full flex items-center justify-center">
                    Click to upload image
                  </div>
                )}
              </div>
            </DraggableElement>
          );
          
        case 'puzzle':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <PuzzleElement 
                element={elementToRender} 
                onClick={(e) => e.stopPropagation()} 
              />
            </DraggableElement>
          );
          
        case 'sequencePuzzle':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <SequencePuzzleElement 
                element={elementToRender} 
                onClick={(e) => e.stopPropagation()} 
              />
            </DraggableElement>
          );
          
        case 'clickSequencePuzzle':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <ClickSequencePuzzleElement 
                element={elementToRender} 
                onClick={(e) => e.stopPropagation()} 
              />
            </DraggableElement>
          );
          
        case 'sliderPuzzle':
          return (
            <DraggableElement key={element.id} element={elementToRender} isActive={isActive}>
              <SliderPuzzleElement 
                element={elementToRender} 
                onClick={(e) => e.stopPropagation()} 
              />
            </DraggableElement>
          );
          
        default:
          return null;
      }
    });
  };
  
  const backgroundElement = elements.find(elem => elem.type === 'background');
  const backgroundStyle = backgroundElement ? {
    backgroundColor: backgroundElement.style?.backgroundColor as string || 'white',
    background: backgroundElement.style?.background as string || undefined
  } : { backgroundColor: 'white' };
  
  const canvasContainerStyle = isFullscreen && isGameMode
    ? {
        width: '100vw',
        height: '100vh',
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-out',
        zIndex: 50,
      }
    : {
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-out',
        position: 'relative' as const,
        width: 'fit-content',
        height: 'fit-content',
      };
      
  const canvasStyle = isFullscreen && isGameMode
    ? {
        width: '100%',
        height: '100%',
        ...backgroundStyle,
        overflow: 'hidden',
        borderRadius: 0,
        maxWidth: '100vw',
        maxHeight: '100vh'
      }
    : {
        width: `${canvasDimensions.width}px`,
        height: `${canvasDimensions.height}px`,
        ...backgroundStyle,
        overflow: 'hidden',
      };
  
  return (
    <div ref={parentRef} className={`flex-1 flex flex-col h-full ${isFullscreen && isGameMode ? 'fullscreen-canvas' : ''}`}>
      <div className={`flex-1 flex items-center justify-center ${isFullscreen && isGameMode ? 'p-0' : 'p-4'} canvas-workspace relative`}
           style={isFullscreen && isGameMode ? { padding: 0, margin: 0, height: '100vh', width: '100vw' } : undefined}>
        <div className="canvas-container" style={canvasContainerStyle}>
          <div
            ref={containerRef}
            className={`relative shadow-lg ${!isFullscreen && 'rounded-lg'} ${!isGameMode && isDraggingOver ? 'ring-2 ring-primary' : ''}`}
            style={canvasStyle}
            onClick={handleCanvasClick}
            onDragOver={!isGameMode ? handleDragOver : undefined}
            onDragLeave={!isGameMode ? handleDragLeave : undefined}
            onDrop={!isGameMode ? handleDrop : undefined}
          >
            {renderElements()}
            {isGameMode && <InventoryIcon />}
          </div>
        </div>
        
        {!isGameMode && (
          <div className="zoom-controls">
            <button onClick={handleZoomOut} title="Zoom Out">
              <Minus size={16} />
            </button>
            <span>{Math.round(zoomLevel * 100)}%</span>
            <button onClick={handleZoomIn} title="Zoom In">
              <Plus size={16} />
            </button>
            <button onClick={handleResetZoom} title="Reset Zoom">
              <RotateCcw size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
