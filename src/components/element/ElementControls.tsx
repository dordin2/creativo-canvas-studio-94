
import React from 'react';
import { DesignElement } from '@/types/designTypes';
import ResizeHandles from './ResizeHandles';
import RotationHandle from './RotationHandle';

interface ElementControlsProps {
  isActive: boolean;
  element: DesignElement;
  frameTransform: string;
  onResizeStart: (e: React.MouseEvent, direction: string) => void;
  onRotateStart: (e: React.MouseEvent) => void;
  showControls: boolean;
  isMultiSelection?: boolean;
}

const ElementControls: React.FC<ElementControlsProps> = ({
  isActive,
  element,
  frameTransform,
  onResizeStart,
  onRotateStart,
  showControls,
  isMultiSelection = false
}) => {
  if (!isActive || !showControls) return null;

  // Calculate the bounding box
  const width = typeof element.size?.width === 'string' 
    ? parseInt(element.size.width, 10) 
    : (element.size?.width || 0);
  
  const height = typeof element.size?.height === 'string' 
    ? parseInt(element.size.height, 10) 
    : (element.size?.height || 0);

  // Don't show resize handles for text elements
  const showResizeHandles = !['heading', 'subheading', 'paragraph'].includes(element.type);

  return (
    <div
      className="element-controls absolute pointer-events-none"
      style={{
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transform: frameTransform
      }}
    >
      {/* Border around element */}
      <div
        className={`absolute border-2 rounded-sm ${isMultiSelection ? 'border-blue-500' : 'border-primary'}`}
        style={{
          top: -1,
          left: -1,
          width: 'calc(100% + 2px)',
          height: 'calc(100% + 2px)',
          pointerEvents: 'none'
        }}
      />

      {/* Resize handles */}
      {showResizeHandles && (
        <ResizeHandles
          onResizeStart={onResizeStart} 
          show={true}
        />
      )}

      {/* Rotation handle */}
      <RotationHandle 
        onRotateStart={onRotateStart}
        show={true}
      />
    </div>
  );
};

export default ElementControls;
