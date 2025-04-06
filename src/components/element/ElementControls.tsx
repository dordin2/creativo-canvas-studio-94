
import { DesignElement } from "@/context/DesignContext";
import ResizeHandles from "./ResizeHandles";
import RotationHandle from "./RotationHandle";

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
  if (!showControls || element.type === 'background') return null;

  // Remove the incorrect comparisons
  const showResizeHandles = isActive;
  const showRotationHandle = isActive;
  
  const elementDimensions = {
    width: element.size?.width || 0,
    height: element.size?.height || 0
  };

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
        
        {/* Drag handle removed */}
      </div>
    </div>
  );
};

export default ElementControls;
