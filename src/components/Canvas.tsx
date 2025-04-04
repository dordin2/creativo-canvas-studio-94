
import { useRef, useEffect, useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import DraggableElement from "./DraggableElement";
import LayersList from "./LayersList"; // Import the new LayersList component

const Canvas = () => {
  const { canvasRef, setCanvasRef, elements, activeElement, setActiveElement } = useDesignState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  
  // Initialize with actual canvas reference
  useEffect(() => {
    if (canvasRef === null && containerRef.current) {
      setCanvasRef(containerRef.current);
    }
  }, [canvasRef, setCanvasRef]);
  
  // Handle resize for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        if (parent) {
          const maxWidth = parent.clientWidth - 40; // Padding
          const maxHeight = parent.clientHeight - 40;
          
          // Maintain aspect ratio
          const aspectRatio = 4/3;
          let width = maxWidth;
          let height = width / aspectRatio;
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
          
          setCanvasDimensions({ width, height });
        }
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  // Handle deselection when clicking on canvas background
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setActiveElement(null);
    }
  };
  
  const renderElements = () => {
    // Sort elements by layer (lower layers first, higher layers on top)
    const sortedElements = [...elements]
      .filter(element => element.type !== 'background')
      .sort((a, b) => a.layer - b.layer);
    
    return sortedElements.map((element) => {
      const isActive = activeElement?.id === element.id;
      
      // Handle element click
      const handleElementClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveElement(element);
      };
      
      // Render different element types
      switch (element.type) {
        case 'rectangle':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div
                className="h-full w-full"
                onClick={handleElementClick}
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
                onClick={handleElementClick}
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
                onClick={handleElementClick}
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
                onClick={handleElementClick}
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
                  margin: 0
                }}
                onClick={handleElementClick}
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
                  margin: 0
                }}
                onClick={handleElementClick}
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
                  maxWidth: '300px'
                }}
                onClick={handleElementClick}
              >
                {element.content || 'Add your text here. Click to edit this text.'}
              </p>
            </DraggableElement>
          );
          
        case 'image':
          return (
            <DraggableElement key={element.id} element={element} isActive={isActive}>
              <div
                className="h-full w-full flex items-center justify-center overflow-hidden bg-gray-100"
                onClick={handleElementClick}
              >
                {element.src ? (
                  <img 
                    src={element.src} 
                    alt="Uploaded content" 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                  />
                ) : (
                  <div className="text-sm text-gray-400">
                    Click to upload image
                  </div>
                )}
              </div>
            </DraggableElement>
          );
          
        default:
          return null;
      }
    });
  };
  
  // Find background element if it exists
  const backgroundElement = elements.find(elem => elem.type === 'background');
  const backgroundStyle = backgroundElement ? {
    backgroundColor: backgroundElement.style?.backgroundColor as string || 'white',
    background: backgroundElement.style?.background as string || undefined
  } : { backgroundColor: 'white' };
  
  return (
    <div className="flex-1 flex items-center justify-center p-8 canvas-workspace">
      <div
        ref={containerRef}
        className="relative shadow-lg rounded-lg overflow-hidden transition-all"
        style={{
          width: canvasDimensions.width,
          height: canvasDimensions.height,
          ...backgroundStyle
        }}
        onClick={handleCanvasClick}
      >
        {renderElements()}
      </div>
    </div>
  );
};

export default Canvas;
