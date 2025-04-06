
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Trash2, Copy, Eye, EyeOff } from "lucide-react";
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
  const { updateElement, removeElement, addElement } = useDesignState();
  
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeElement(element.id);
  };

  const isVisible = !element.isHidden;

  return (
    <div className="element-controls-wrapper" style={{ pointerEvents: 'none' }}>
      <div
        className="element-frame"
        style={{
          left: element.position.x,
          top: element.position.y,
          width: elementDimensions.width,
          height: elementDimensions.height,
          transform: frameTransform,
          pointerEvents: 'none',
          zIndex: 1000 + element.layer,
          border: isActive ? '1px solid #6366F1' : 'none',
          opacity: 1, // Always show border at full opacity when active
        }}
      />
      
      <div 
        style={{
          position: 'absolute',
          left: element.position.x,
          top: element.position.y,
          width: elementDimensions.width,
          height: elementDimensions.height,
          transform: frameTransform,
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
