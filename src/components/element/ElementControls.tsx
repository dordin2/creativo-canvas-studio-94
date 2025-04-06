
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
import { getRotation } from "@/utils/elementStyles";

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
  const { updateElement, removeElement, addElement, canvases } = useDesignState();
  
  // Don't render controls at all if the element is hidden or it's the background
  if ((!showControls && !isActive) || element.type === 'background' || element.isHidden) {
    return null;
  }

  const showResizeHandles = isActive;
  const showRotationHandle = isActive;
  
  const elementDimensions = {
    width: element.size?.width || 0,
    height: element.size?.height || 0
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a duplicate with the same properties but at a slightly offset position
    const duplicateProps = {
      ...element,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20
      }
    };
    
    // Remove the id to ensure a new one is generated
    delete (duplicateProps as any).id;
    
    addElement(element.type, duplicateProps);
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
    
    // Toggle between 'none' and the last selected interaction type or default to 'puzzle'
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
  
  // Check if the element is a puzzle type - don't show interactive button for puzzles
  const isPuzzleElement = ['puzzle', 'sequencePuzzle', 'clickSequencePuzzle', 'sliderPuzzle'].includes(element.type);

  // Check if this element has canvas navigation interaction
  const hasCanvasNavigation = element.interaction?.type === 'canvasNavigation';
  const targetCanvasName = hasCanvasNavigation && element.interaction?.targetCanvasId 
    ? canvases.find(c => c.id === element.interaction?.targetCanvasId)?.name || 'Unknown Canvas'
    : '';

  // Get the current rotation directly from the element style for consistent transforms
  const rotation = getRotation(element);
  
  // Apply the same transformation to the frame as the element has
  const frameStyle = {
    position: 'absolute' as const,
    left: element.position.x,
    top: element.position.y,
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
          left: element.position.x,
          top: element.position.y,
          width: elementDimensions.width,
          height: elementDimensions.height,
          transform: `rotate(${rotation}deg)`,
          zIndex: 1000 + element.layer,
          pointerEvents: 'none',
        }}
      >
        <ResizeHandles
          show={showResizeHandles}
          onResizeStart={onResizeStart}
        />
        
        <RotationHandle
          show={showRotationHandle}
          onRotateStart={onRotateStart}
        />
        
        {isActive && (
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
