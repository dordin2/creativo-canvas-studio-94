
import { useRef, useEffect, useState } from "react";
import { useDesignState } from "@/context/DesignContext";

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
    return elements.map((element) => {
      // Background is handled separately
      if (element.type === 'background') return null;
      
      const isActive = activeElement?.id === element.id;
      
      const elementStyle = {
        ...element.style,
        position: 'absolute' as const,
        transform: `translate(${element.position.x}px, ${element.position.y}px)`,
        border: isActive ? '2px solid #8B5CF6' : 'none',
      };
      
      const handleElementClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveElement(element);
      };
      
      // Render different element types
      switch (element.type) {
        case 'rectangle':
          return (
            <div
              key={element.id}
              className="canvas-element"
              style={{
                ...elementStyle,
                width: element.size?.width || 100,
                height: element.size?.height || 80,
                backgroundColor: element.style?.backgroundColor || '#8B5CF6',
                borderRadius: element.style?.borderRadius || '4px'
              }}
              onClick={handleElementClick}
            />
          );
          
        case 'circle':
          return (
            <div
              key={element.id}
              className="canvas-element"
              style={{
                ...elementStyle,
                width: element.size?.width || 100,
                height: element.size?.width || 100,
                backgroundColor: element.style?.backgroundColor || '#8B5CF6',
                borderRadius: '50%'
              }}
              onClick={handleElementClick}
            />
          );
          
        case 'triangle':
          return (
            <div
              key={element.id}
              className="canvas-element"
              style={{
                ...elementStyle,
                width: 0,
                height: 0,
                borderLeft: `${(element.size?.width || 50)}px solid transparent`,
                borderRight: `${(element.size?.width || 50)}px solid transparent`,
                borderBottom: `${(element.size?.height || 100)}px solid ${element.style?.backgroundColor || '#8B5CF6'}`,
                backgroundColor: 'transparent'
              }}
              onClick={handleElementClick}
            />
          );
          
        case 'line':
          return (
            <div
              key={element.id}
              className="canvas-element"
              style={{
                ...elementStyle,
                width: element.size?.width || 100,
                height: '2px',
                backgroundColor: element.style?.backgroundColor || '#8B5CF6'
              }}
              onClick={handleElementClick}
            />
          );
          
        case 'heading':
          return (
            <div
              key={element.id}
              className="canvas-element"
              style={elementStyle}
              onClick={handleElementClick}
            >
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                color: element.style?.color || '#1F2937',
                margin: 0
              }}>
                {element.content || 'Add a heading'}
              </h2>
            </div>
          );
          
        case 'subheading':
          return (
            <div
              key={element.id}
              className="canvas-element"
              style={elementStyle}
              onClick={handleElementClick}
            >
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                color: element.style?.color || '#1F2937',
                margin: 0
              }}>
                {element.content || 'Add a subheading'}
              </h3>
            </div>
          );
          
        case 'paragraph':
          return (
            <div
              key={element.id}
              className="canvas-element"
              style={{
                ...elementStyle,
                maxWidth: '300px'
              }}
              onClick={handleElementClick}
            >
              <p style={{ 
                fontSize: '16px',
                color: element.style?.color || '#1F2937',
                margin: 0
              }}>
                {element.content || 'Add your text here. Click to edit this text.'}
              </p>
            </div>
          );
          
        case 'image':
          return (
            <div
              key={element.id}
              className="canvas-element"
              style={{
                ...elementStyle,
                width: element.size?.width || 200,
                height: element.size?.height || 150,
                backgroundColor: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
              onClick={handleElementClick}
            >
              {element.src ? (
                <img 
                  src={element.src} 
                  alt="Uploaded content" 
                  style={{ maxWidth: '100%', maxHeight: '100%' }} 
                />
              ) : (
                <div className="text-sm text-gray-400">
                  Click to upload image
                </div>
              )}
            </div>
          );
          
        default:
          return null;
      }
    });
  };
  
  // Find background element if it exists
  const backgroundElement = elements.find(elem => elem.type === 'background');
  const backgroundStyle = backgroundElement ? {
    backgroundColor: backgroundElement.style?.backgroundColor || 'white',
    background: backgroundElement.style?.background || undefined
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
