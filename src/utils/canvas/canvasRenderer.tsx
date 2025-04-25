
import React from "react";
import DraggableElement from "@/components/element/DraggableElement";
import { DesignElement } from "@/types/designTypes";

export const renderCanvasElements = (
  elements: DesignElement[], 
  activeElement: DesignElement | null
) => {
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
      case 'sequencePuzzle':
      case 'clickSequencePuzzle':
      case 'sliderPuzzle':
        return (
          <DraggableElement key={element.id} element={element} isActive={isActive}>
            {/* No children needed - DraggableElement will handle the puzzle rendering */}
          </DraggableElement>
        );
        
      default:
        return null;
    }
  });
};
