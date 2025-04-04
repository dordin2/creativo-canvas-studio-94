
import { useRef, useEffect, useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import DraggableElement from "./DraggableElement";
import LayersList from "./LayersList";
import { Minus, Plus, RotateCcw } from "lucide-react";
import PuzzleElement from "./element/PuzzleElement";
import SequencePuzzleElement from "./element/SequencePuzzleElement";

const Canvas = () => {
  const { 
    canvasRef, 
    setCanvasRef, 
    elements, 
    activeElement, 
    setActiveElement,
    handleImageUpload 
  } = useDesignState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 900 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const parentRef = useRef<HTMLDivElement>(null);

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
        
        const minWidth = 1200;
        const minHeight = 900;
        
        const maxWidth = Math.max(minWidth, parentWidth - 20);
        const maxHeight = Math.max(minHeight, parentHeight - 40);
        
        const aspectRatio = 4/3;
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
  }, []);
  
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
    if (e.target === containerRef.current) {
      setActiveElement(null);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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
      
      switch (element.type) {
        case 'rectangle':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div
                className="h-full w-full"
                style={{
                  backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
                  borderRadius: element.style?.borderRadius || '4px'
                }}
              />
            </DraggableElement>
          );
          
        case 'circle':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div
                className="h-full w-full rounded-full"
                style={{
                  backgroundColor: element.style?.backgroundColor as string || '#8B5CF6'
                }}
              />
            </DraggableElement>
          );
          
        case 'triangle':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div
                className="absolute"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${(element.size?.width || 50)}px solid transparent`,
                  borderRight: `${(element.size?.width || 50)}px solid transparent`,
                  borderBottom: `${(element.size?.height || 100)}px solid ${element.style?.backgroundColor as string || '#8B5CF6'}`,
                  backgroundColor: 'transparent'
                }}
              />
            </DraggableElement>
          );
          
        case 'line':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div
                className="h-full w-full"
                style={{
                  backgroundColor: element.style?.backgroundColor as string || '#8B5CF6'
                }}
              />
            </DraggableElement>
          );
          
        case 'heading':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <h2 
                style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold',
                  color: element.style?.color as string || '#1F2937',
                  margin: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'text'
                }}
              >
                {element.content || 'Add a heading'}
              </h2>
            </DraggableElement>
          );
          
        case 'subheading':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <h3 
                style={{ 
                  fontSize: '20px', 
                  fontWeight: '600',
                  color: element.style?.color as string || '#1F2937',
                  margin: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'text'
                }}
              >
                {element.content || 'Add a subheading'}
              </h3>
            </DraggableElement>
          );
          
        case 'paragraph':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <p 
                style={{ 
                  fontSize: '16px',
                  color: element.style?.color as string || '#1F2937',
                  margin: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'text',
                  overflowWrap: 'break-word'
                }}
              >
                {element.content || 'Add your text here. Click to edit this text.'}
              </p>
            </DraggableElement>
          );
          
        case 'image':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
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
                    handleImageUpload(element.id, files[0]);
                  }
                }}
              >
                {element.dataUrl ? (
                  <img 
                    src={element.dataUrl} 
                    alt="Uploaded content" 
                    className="w-full h-full" 
                    draggable={false}
                    style={{ 
                      objectFit: 'contain', 
                      width: '100%', 
                      height: '100%'
                    }}
                  />
                ) : element.src ? (
                  <img 
                    src={element.src} 
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
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <PuzzleElement 
                element={element} 
                onClick={(e) => e.stopPropagation()} 
              />
            </DraggableElement>
          );
          
        case 'sequencePuzzle':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <SequencePuzzleElement 
                element={element} 
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
  
  return (
    <div ref={parentRef} className="flex-1 flex items-center justify-center p-4 canvas-workspace relative">
      <div className="canvas-container" style={{ 
        transform: `scale(${zoomLevel})`, 
        transformOrigin: 'center center', 
        transition: 'transform 0.2s ease-out',
        position: 'relative',
        width: 'fit-content',
        height: 'fit-content'
      }}>
        <div
          ref={containerRef}
          className={`relative shadow-lg rounded-lg ${isDraggingOver ? 'ring-2 ring-primary' : ''}`}
          style={{
            width: `${canvasDimensions.width}px`,
            height: `${canvasDimensions.height}px`,
            ...backgroundStyle,
            overflow: 'hidden'
          }}
          onClick={handleCanvasClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {renderElements()}
        </div>
        
        <div 
          className="element-controls-wrapper"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: canvasDimensions.width,
            height: canvasDimensions.height,
            overflow: 'visible',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      </div>
      
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
    </div>
  );
};

export default Canvas;
