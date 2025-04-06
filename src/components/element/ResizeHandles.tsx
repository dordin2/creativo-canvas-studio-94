
import React from 'react';

export interface ResizeHandlesProps {
  onResizeStart: (e: React.MouseEvent, direction: string) => void;
  show: boolean;
}

const ResizeHandles: React.FC<ResizeHandlesProps> = ({ onResizeStart, show }) => {
  if (!show) return null;
  
  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    onResizeStart(e, direction);
  };

  return (
    <>
      {/* Top left */}
      <div
        className="absolute w-2 h-2 bg-white border border-primary rounded-full cursor-nwse-resize pointer-events-auto"
        style={{ top: -4, left: -4 }}
        onMouseDown={(e) => handleMouseDown(e, 'tl')}
      />
      
      {/* Top center */}
      <div
        className="absolute w-2 h-2 bg-white border border-primary rounded-full cursor-ns-resize pointer-events-auto"
        style={{ top: -4, left: 'calc(50% - 3px)' }}
        onMouseDown={(e) => handleMouseDown(e, 'tc')}
      />
      
      {/* Top right */}
      <div
        className="absolute w-2 h-2 bg-white border border-primary rounded-full cursor-nesw-resize pointer-events-auto"
        style={{ top: -4, right: -4 }}
        onMouseDown={(e) => handleMouseDown(e, 'tr')}
      />
      
      {/* Middle left */}
      <div
        className="absolute w-2 h-2 bg-white border border-primary rounded-full cursor-ew-resize pointer-events-auto"
        style={{ top: 'calc(50% - 3px)', left: -4 }}
        onMouseDown={(e) => handleMouseDown(e, 'ml')}
      />
      
      {/* Middle right */}
      <div
        className="absolute w-2 h-2 bg-white border border-primary rounded-full cursor-ew-resize pointer-events-auto"
        style={{ top: 'calc(50% - 3px)', right: -4 }}
        onMouseDown={(e) => handleMouseDown(e, 'mr')}
      />
      
      {/* Bottom left */}
      <div
        className="absolute w-2 h-2 bg-white border border-primary rounded-full cursor-nesw-resize pointer-events-auto"
        style={{ bottom: -4, left: -4 }}
        onMouseDown={(e) => handleMouseDown(e, 'bl')}
      />
      
      {/* Bottom center */}
      <div
        className="absolute w-2 h-2 bg-white border border-primary rounded-full cursor-ns-resize pointer-events-auto"
        style={{ bottom: -4, left: 'calc(50% - 3px)' }}
        onMouseDown={(e) => handleMouseDown(e, 'bc')}
      />
      
      {/* Bottom right */}
      <div
        className="absolute w-2 h-2 bg-white border border-primary rounded-full cursor-nwse-resize pointer-events-auto"
        style={{ bottom: -4, right: -4 }}
        onMouseDown={(e) => handleMouseDown(e, 'br')}
      />
    </>
  );
};

export default ResizeHandles;
