
import { ElementType, DesignElement } from "@/types/designTypes";
import ResizeHandles from "./ResizeHandles";
import RotationHandle from "./RotationHandle";

interface ElementControlsProps {
  isActive: boolean;
  element: DesignElement;
  frameTransform: string;
  onResizeStart: (e: React.MouseEvent, direction: string) => void;
  onRotateStart: (e: React.MouseEvent) => void;
  onDragHandleMouseDown: (e: React.MouseEvent) => void;
  showControls: boolean;
}

const ElementControls = ({ 
  isActive, 
  element, 
  frameTransform, 
  onResizeStart, 
  onRotateStart,
  onDragHandleMouseDown,
  showControls
}: ElementControlsProps) => {
  // Need to fix TypeScript error by explicitly checking if the type is 'background'
  // using type assertion to make TypeScript happy
  const isBackground = element.type === 'background';
  
  if (!showControls || isBackground) return null;

  const showResizeHandles = isActive && !isBackground;
  const showRotationHandle = isActive && !isBackground;
  
  const elementDimensions = {
    width: element.size?.width || 0,
    height: element.size?.height || 0
  };

  return (
    <div className="element-controls-wrapper" style={{ pointerEvents: 'none' }}>
      <div
        className={`element-frame ${isActive ? 'border-2 border-blue-500' : ''}`}
        style={{
          position: 'absolute',
          left: element.position.x,
          top: element.position.y,
          width: elementDimensions.width,
          height: elementDimensions.height,
          transform: frameTransform,
          pointerEvents: 'none',
          zIndex: 1000 + element.layer,
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
        {/* Invisible drag overlay that appears for all elements when active */}
        {isActive && (
          <div
            className="drag-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              cursor: 'move',
              pointerEvents: 'auto',
              zIndex: 1002,
            }}
            onMouseDown={onDragHandleMouseDown}
          />
        )}
        
        <ResizeHandles
          show={showResizeHandles}
          onResizeStart={onResizeStart}
        />
        
        <RotationHandle
          show={showRotationHandle}
          onRotateStart={onRotateStart}
        />
      </div>
    </div>
  );
};

export default ElementControls;
