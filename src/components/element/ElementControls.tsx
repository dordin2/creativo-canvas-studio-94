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
  canvasScale?: number;
}

const ElementControls = ({ 
  isActive, 
  element, 
  frameTransform, 
  onResizeStart, 
  onRotateStart,
  showControls,
  canvasScale = 1
}: ElementControlsProps) => {
  const { updateElement, removeElement, addElement, canvases, activeCanvasIndex } = useDesignState();
  const { isInteractiveMode } = useInteractiveMode();
  const { t, language } = useLanguage();
  
  const hasValidAspectRatio = () => {
    if (element.type !== 'image' || !element.originalSize) return false;
    const { width, height } = element.originalSize;
    const aspectRatio = width / height;
    const targetRatio = 16 / 9;
    const tolerance = 0.1;
    return Math.abs(aspectRatio - targetRatio) < tolerance;
  };

  const canBeBackground = element.type === 'image' && hasValidAspectRatio();
  
  const handleSetAsBackground = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const currentCanvas = canvases[activeCanvasIndex];
    if (currentCanvas) {
      const backgroundElement = currentCanvas.elements.find(el => el.layer === 0);
      if (backgroundElement) {
        updateElement(backgroundElement.id, {
          layer: Math.max(...currentCanvas.elements.map(el => el.layer)) + 1
        });
      }
    }
    
    updateElement(element.id, {
      position: { x: 0, y: 0 },
      size: { width: 1600, height: 900 },
      layer: 0
    });
  };
  
  const handleDetachFromBackground = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (element.layer !== 0) return;
    
    updateElement(element.id, {
      position: { x: 100, y: 100 },
      size: { 
        width: element.originalSize?.width || 400,
        height: element.originalSize?.height || 225
      },
      layer: 1
    });
  };

  if ((!showControls && !isActive) || element.isHidden || element.layer === 0) {
    return null;
  }

  const showResizeHandles = isActive && !isInteractiveMode;
  const showRotationHandle = isActive && !isInteractiveMode;
  
  const elementDimensions = {
    width: element.size?.width ? Math.round(element.size.width) : 0,
    height: element.size?.height ? Math.round(element.size.height) : 0
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log("ElementControls - Original element to duplicate:", element);
    
    const duplicateProps = prepareElementForDuplication(element);
    
    console.log("ElementControls - Duplicate props before adding:", duplicateProps);
    
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
  
  const rotation = getRotation(element);
  
  const posX = Math.round(element.position.x);
  const posY = Math.round(element.position.y);

  return (
    <div 
      className="element-controls" 
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
        width: element.size?.width || 0,
        height: element.size?.height || 0,
        transform: `rotate(${rotation}deg) scale(${canvasScale})`,
        transformOrigin: '0 0',
        pointerEvents: 'none',
        zIndex: 1000 + element.layer,
      }}
    >
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
  );
};

export default ElementControls;
