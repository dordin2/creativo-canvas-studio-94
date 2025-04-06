
import { DesignElement } from "@/context/DesignContext";
import ResizeHandles from "./ResizeHandles";
import RotationHandle from "./RotationHandle";
import { Move } from "lucide-react";

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
        
        {/* Drag handle positioned above the rotation handle */}
        <div 
          className="drag-handle"
          style={{ 
            position: 'absolute',
            top: -36, 
            left: '50%', 
            transform: 'translateX(-50%)',
            width: '24px',
            height: '24px',
            backgroundColor: '#8B5CF6',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'move',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            pointerEvents: 'auto',
            zIndex: 1001,
          }}
          onMouseDown={onDragHandleMouseDown}
        >
          <Move className="text-white" size={14} />
        </div>
      </div>
    </div>
  );
};

export default ElementControls;
