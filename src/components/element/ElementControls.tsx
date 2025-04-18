
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Trash2, Copy, Eye, EyeOff, Maximize2, Frame } from "lucide-react";
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
import { prepareElementForDuplication } from "@/utils/elementUtils";
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import { useLanguage } from "@/context/LanguageContext";

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
  const { updateElement, removeElement, addElement, canvases, activeCanvasIndex } = useDesignState();
  const { isInteractiveMode } = useInteractiveMode();
  const { t, language } = useLanguage();
  
  // Check if the image has a 16:9 aspect ratio (with some tolerance)
  const hasValidAspectRatio = () => {
    if (element.type !== 'image' || !element.originalSize) return false;
    const { width, height } = element.originalSize;
    const aspectRatio = width / height;
    const targetRatio = 16 / 9;
    const tolerance = 0.1; // 10% tolerance
    return Math.abs(aspectRatio - targetRatio) < tolerance;
  };

  // Check if current element can be converted to background
  const canBeBackground = element.type === 'image' && hasValidAspectRatio();
  
  // Convert image to background
  const handleSetAsBackground = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // First, remove any existing background
    const currentCanvas = canvases[activeCanvasIndex];
    if (currentCanvas) {
      const backgroundElement = currentCanvas.elements.find(el => el.type === 'background');
      if (backgroundElement) {
        removeElement(backgroundElement.id);
      }
    }
    
    // Update current element to be background
    updateElement(element.id, {
      type: 'background',
      position: { x: 0, y: 0 },
      size: { width: 1600, height: 900 }, // Fixed canvas size
      layer: 0
    });
  };
  
  // Detach image from background
  const handleDetachFromBackground = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (element.type !== 'background') return;
    
    // Convert back to regular image
    updateElement(element.id, {
      type: 'image',
      position: { x: 100, y: 100 }, // Place in a visible position
      size: { 
        width: element.originalSize?.width || 400,
        height: element.originalSize?.height || 225
      },
      layer: 1
    });
  };

  // Don't render controls at all if the element is hidden or we're in game mode
  if ((!showControls && !isActive) || element.isHidden) {
    return null;
  }

  const showResizeHandles = isActive && !isInteractiveMode;
  const showRotationHandle = isActive && !isInteractiveMode;
  
  // Round dimensions to ensure consistency with the element
  const elementDimensions = {
    width: element.size?.width ? Math.round(element.size.width) : 0,
    height: element.size?.height ? Math.round(element.size.height) : 0
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log("ElementControls - Original element to duplicate:", element);
    
    // Use the utility function to prepare the element for duplication
    const duplicateProps = prepareElementForDuplication(element);
    
    console.log("ElementControls - Duplicate props before adding:", duplicateProps);
    
    // Add the duplicated element
    addElement(element.type, duplicateProps);
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, {
      isHidden: !element.isHidden
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeElement(element.id);
  };

  const isVisible = !element.isHidden;
  
  // Get the current rotation directly from the element style for consistent transforms
  const rotation = getRotation(element);
  
  // Use exact positioning with Math.round to ensure consistency
  const posX = Math.round(element.position.x);
  const posY = Math.round(element.position.y);
  
  // Apply the same transformation to the frame as the element has
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
      
      <div style={{...frameStyle, pointerEvents: 'none'}}>
        {!isInteractiveMode && (
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
        
        {isActive && !isInteractiveMode && (
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
            
            {canBeBackground && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 bg-white"
                      onClick={handleSetAsBackground}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'he' ? 'הפוך לרקע' : 'Set as Background'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {element.type === 'background' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 bg-white"
                      onClick={handleDetachFromBackground}
                    >
                      <Frame className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'he' ? 'הפרד מהרקע' : 'Detach from Background'}</p>
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
