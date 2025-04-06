
import React from 'react';

export interface RotationHandleProps {
  onRotateStart: (e: React.MouseEvent) => void;
  show: boolean;
}

const RotationHandle: React.FC<RotationHandleProps> = ({ onRotateStart, show }) => {
  if (!show) return null;
  
  return (
    <div
      className="absolute w-3 h-3 bg-primary rounded-full cursor-crosshair pointer-events-auto"
      style={{ top: -16, left: 'calc(50% - 4px)' }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onRotateStart(e);
      }}
    />
  );
};

export default RotationHandle;
