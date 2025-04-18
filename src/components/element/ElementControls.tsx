import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Trash2, Copy, Eye, EyeOff, Zap, Navigation } from "lucide-react";
import ResizeHandles from "./ResizeHandles";
import RotationHandle from "./RotationHandle";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ElementControlsProps {
  isActive: boolean;
  element: DesignElement;
  frameTransform: string;
  onResizeStart: (e: React.MouseEvent, direction: string) => void;
  onRotateStart: (e: React.MouseEvent) => void;
  showControls: boolean;
}

const ElementControls = ({ 
  isActive, 
  element, 
  frameTransform, 
  onResizeStart, 
  onRotateStart,
  showControls
}: ElementControlsProps) => {
  const { updateElement, removeElement, addElement, canvases, isInteractionMode } = useDesignState();
  
  if ((!showControls && !isActive) || element.type === 'background' || element.isHidden) {
    return null;
  }

  const showResizeHandles = isActive && !isInteractionMode;
  const showRotationHandle = isActive && !isInteractionMode;
  
  const elementDimensions = {
    width: element.size?.width ? Math.round(element.size.width) : 0,
    height: element.size?.height ? Math.round(element.size.height) : 0
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log("ElementControls - Starting duplication of element:", element.id, element.type);
    
    if (element.type === 'image') {
      console.log("ElementControls - Image element details before duplication:", {
        hasDataUrl: !!element.dataUrl,
        dataUrlLength: element.dataUrl ? element.dataUrl.length : 0,
        hasThumbnail: !!element.thumbnailDataUrl,
        hasSrc: !!element.src,
        hasCacheKey: !!element.cacheKey,
        originalSize: element.originalSize,
        size: element.size,
        position: element.position,
        style: element.style
      });
    }
    
    const duplicateProps = prepareElementForDuplication(element);
    
    console.log("ElementControls - Duplicate props prepared:", {
      type: element.type,
      hasDataUrl: element.type === 'image' ? !!duplicateProps.dataUrl : 'n/a',
      dataUrlLength: element.type === 'image' && duplicateProps.dataUrl ? duplicateProps.dataUrl.length : 0,
      size: duplicateProps.size,
      originalSize: duplicateProps.originalSize,
      style: duplicateProps.style
    });
    
    const newElement = addElement(element.type, duplicateProps);
    
    console.log("ElementControls - Duplication complete, new element ID:", newElement.id);
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, {
      isHidden: !element.isHidden
    });
  };

  const handleToggleInteractive = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentInteraction = element.interaction || { type: 'none' };
    
    const newType = currentInteraction.type === 'none' ? 
      (currentInteraction.type === 'none' ? 'puzzle' : currentInteraction.type) : 
      'none';
      
    updateElement(element.id, {
      interaction: {
        ...currentInteraction,
        type: newType
      }
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeElement(element.id);
  };

  const isVisible = !element.isHidden;
  const isInteractive = element.interaction?.type !== 'none' && element.interaction?.type !== undefined;
  
  const isPuzzleElement = ['puzzle', 'sequencePuzzle', 'clickSequencePuzzle', 'sliderPuzzle'].includes(element.type);

  const hasCanvasNavigation = element.interaction?.type === 'canvasNavigation';
  const targetCanvasName = hasCanvasNavigation && element.interaction?.targetCanvasId 
    ? canvases.find(c => c.id === element.interaction?.targetCanvasId)?.name || 'Unknown Canvas'
    : '';

  const rotation = getRotation(element);
  
  const posX = Math.round(element.position.x);
  const posY = Math.round(element.position.y);
  
  const frameStyle = {
    position: 'absolute' as const,
    left: posX,
    top: posY,
    width: elementDimensions.width,
    height: elementDimensions.height,
    transform: `rotate(${rotation}deg)`,
    pointerEvents: 'none' as const,
    zIndex: 1000 + element.layer,
    border: isActive ? '1px solid #6366F1' : 'none',
    opacity: 1,
    boxSizing: 'border-box' as const,
    borderRadius: '2px',
  };

  return (
    <div className="element-controls-wrapper" style={{ pointerEvents: 'none' }}>
      <div
        className="element-frame"
        style={frameStyle}
      />
      
      <div 
        style={{
          position: 'absolute',
          left: posX,
          top: posY,
          width: elementDimensions.width,
          height: elementDimensions.height,
          transform: `rotate(${rotation}deg)`,
          zIndex: 1000 + element.layer,
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
      >
        {!isInteractionMode && (
          <>
            <ResizeHandles
              show={showResizeHandles}
              onResizeStart={onResizeStart}
            />
            
            <RotationHandle
              show={showRotationHandle}
              onRotateStart={onRotateStart}
            />
          </>
        )}
        
        {isActive && !isInteractionMode && (
          <div 
            className="element-controls"
            style={{
              position: 'absolute',
              top: '-40px',
              right: '0',
              display: 'flex',
              gap: '8px',
              pointerEvents: 'auto',
            }}
          >
            {!isPuzzleElement && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={`h-8 w-8 bg-white ${isInteractive ? 'text-blue-600 border-blue-600' : ''}`}
                      onClick={handleToggleInteractive}
                    >
                      {hasCanvasNavigation ? (
                        <Navigation className="h-4 w-4" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasCanvasNavigation 
                      ? `Canvas Navigation to: ${targetCanvasName}`
                      : (isInteractive ? 'Interactive (On)' : 'Interactive (Off)')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 bg-white"
                    onClick={handleDuplicate}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Duplicate</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 bg-white"
                    onClick={handleToggleVisibility}
                  >
                    {isVisible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isVisible ? 'Hide' : 'Show'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 bg-white text-red-500"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementControls;
