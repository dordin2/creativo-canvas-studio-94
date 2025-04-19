
import { CSSProperties, MouseEvent as ReactMouseEvent } from "react";

interface ResizeHandlesProps {
  show: boolean;
  onResizeStart: (e: ReactMouseEvent, direction: string) => void;
}

const ResizeHandles = ({ show, onResizeStart }: ResizeHandlesProps) => {
  if (!show) return null;

  const handleStyle: CSSProperties = {
    position: 'absolute',
    width: '12px',
    height: '12px',
    background: 'white',
    border: '2px solid #4F46E5',
    borderRadius: '50%',
    zIndex: 1001,
    pointerEvents: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  };

  const createResizeHandle = (position: string, cursorType: string, direction: string) => {
    let positionStyle: CSSProperties = {};
    let transform = 'translate(-50%, -50%)';
    
    switch (position) {
      case 'nw':
        positionStyle = { top: '0px', left: '0px' };
        transform = 'translate(-50%, -50%)';
        break;
      case 'ne':
        positionStyle = { top: '0px', right: '0px', left: 'auto' };
        transform = 'translate(50%, -50%)';
        break;
      case 'se':
        positionStyle = { bottom: '0px', right: '0px', top: 'auto', left: 'auto' };
        transform = 'translate(50%, 50%)';
        break;
      case 'sw':
        positionStyle = { bottom: '0px', left: '0px', top: 'auto' };
        transform = 'translate(-50%, 50%)';
        break;
    }
    
    return (
      <div 
        key={direction}
        className="resize-handle"
        style={{ 
          ...handleStyle, 
          ...positionStyle, 
          transform,
          cursor: `${cursorType}-resize`,
          touchAction: 'none',
        }}
        onMouseDown={(e) => onResizeStart(e, direction)}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          
          const syntheticEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault(),
            stopPropagation: () => e.stopPropagation(),
            target: e.target,
            currentTarget: e.currentTarget,
            type: 'mousedown',
          } as unknown as ReactMouseEvent;
          
          onResizeStart(syntheticEvent, direction);
        }}
      />
    );
  };

  return (
    <>
      {createResizeHandle('nw', 'nw', 'nw')}
      {createResizeHandle('ne', 'ne', 'ne')}
      {createResizeHandle('se', 'se', 'se')}
      {createResizeHandle('sw', 'sw', 'sw')}
    </>
  );
};

export default ResizeHandles;
