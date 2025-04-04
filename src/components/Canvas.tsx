import React, { useRef, useEffect, useState } from "react";
import { useDesignState, DesignElement } from "@/context/DesignContext";
import DraggableElement from "@/components/DraggableElement";
import EditableText from "@/components/element/EditableText";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import PuzzleElement from "./element/PuzzleElement";
import SequencePuzzleElement from "./element/SequencePuzzleElement";
import ClickSequencePuzzleElement from "./element/ClickSequencePuzzleElement";

const Canvas = () => {
  const { 
    elements, 
    activeElement, 
    canvasRef, 
    updateElementWithoutHistory, 
    commitToHistory,
    setActiveElement 
  } = useDesignState();
  const [zoom, setZoom] = useState(100);
  
  const handleElementSelect = (element: DesignElement, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent click on element from triggering canvas click
    setActiveElement(element);
  };
  
  const handleCanvasClick = () => {
    setActiveElement(null);
  };
  
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 10, 50));
  };
  
  useEffect(() => {
    if (canvasRef) {
      canvasRef.style.transformOrigin = '0 0';
      canvasRef.style.transform = `scale(${zoom / 100})`;
    }
  }, [zoom, canvasRef]);
  
  const renderElement = (element: DesignElement) => {
    const isActive = activeElement?.id === element.id;
    
    // Define common element props
    const elementProps = {
      key: element.id,
      element,
      isActive,
      onSelect: handleElementSelect,
      onUpdateElement: updateElementWithoutHistory,
      onCommitChanges: commitToHistory,
      canvasRef
    };
    
    switch (element.type) {
      case "rectangle":
      case "circle":
      case "triangle":
      case "line":
        return <DraggableElement {...elementProps} />;
        
      case "heading":
      case "subheading":
      case "paragraph":
        return <DraggableElement {...elementProps}>
          {(props) => (
            <EditableText element={element} onChange={props.onChange} />
          )}
        </DraggableElement>;
        
      case "image":
        return <DraggableElement {...elementProps} />;

      case "puzzle":
        return <DraggableElement {...elementProps}>
          {(props) => (
            <PuzzleElement element={element} onClick={props.onClick} />
          )}
        </DraggableElement>;

      case "sequencePuzzle":
        return <DraggableElement {...elementProps}>
          {(props) => (
            <SequencePuzzleElement element={element} onClick={props.onClick} />
          )}
        </DraggableElement>;
      
      case "clickSequencePuzzle":
        return <DraggableElement {...elementProps}>
          {(props) => (
            <ClickSequencePuzzleElement element={element} onClick={props.onClick} />
          )}
        </DraggableElement>;
      
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center bg-gray-100 p-2 border-b">
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="px-2 text-sm font-medium">{zoom}%</span>
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
      
      <div 
        className="flex-1 relative overflow-auto canvas-container"
        onClick={handleCanvasClick}
      >
        <div 
          className="absolute top-0 left-0 w-full h-full canvas-workspace"
          style={{ transform: `scale(${zoom / 100})` }}
          ref={canvasRef}
        >
          {elements.map(renderElement)}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
