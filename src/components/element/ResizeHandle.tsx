
import React from 'react';

interface ResizeHandleProps {
  position: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
  onResizeStart: (e: React.MouseEvent | React.TouchEvent, position: string) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ position, onResizeStart }) => {
  const handleClass = `absolute w-3 h-3 bg-white border-2 border-primary rounded-full 
    ${position === 'nw' ? 'top-0 left-0 cursor-nw-resize -translate-x-1/2 -translate-y-1/2' :
      position === 'n' ? 'top-0 left-1/2 cursor-n-resize -translate-x-1/2 -translate-y-1/2' :
      position === 'ne' ? 'top-0 right-0 cursor-ne-resize translate-x-1/2 -translate-y-1/2' :
      position === 'e' ? 'top-1/2 right-0 cursor-e-resize translate-x-1/2 -translate-y-1/2' :
      position === 'se' ? 'bottom-0 right-0 cursor-se-resize translate-x-1/2 translate-y-1/2' :
      position === 's' ? 'bottom-0 left-1/2 cursor-s-resize -translate-x-1/2 translate-y-1/2' :
      position === 'sw' ? 'bottom-0 left-0 cursor-sw-resize -translate-x-1/2 translate-y-1/2' :
      'top-1/2 left-0 cursor-w-resize -translate-x-1/2 -translate-y-1/2'}`;

  return (
    <div 
      className={handleClass}
      onMouseDown={(e) => onResizeStart(e, position)}
      onTouchStart={(e) => onResizeStart(e, position)}
    />
  );
};

export default ResizeHandle;
