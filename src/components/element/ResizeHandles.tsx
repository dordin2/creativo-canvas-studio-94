
import { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { useDesignState } from "@/context/DesignContext";

interface ResizeHandlesProps {
  show: boolean;
  onResizeStart: (e: ReactMouseEvent, direction: string) => void;
}

const ResizeHandles = ({ show, onResizeStart }: ResizeHandlesProps) => {
  const { isGameMode } = useDesignState();
  
  if (!show || isGameMode) return null;

  const handleStyle: CSSProperties = {
    position: 'absolute',
    width: '12px',  // Slightly larger for better touch targets
    height: '12px',
    background: 'white',
    border: '2px solid #4F46E5',
    borderRadius: '50%',
    zIndex: 1001,
    pointerEvents: 'auto',
    touchAction: 'none',  // Prevent browser handling of all panning/zooming gestures
  };

  const createResizeHandle = (position: string, cursorType: string, direction: string) => {
    let positionStyle: CSSProperties = {};
    let transform = 'translate(-50%, -50%)';
    
    switch (position) {
      case 'nw':
        positionStyle = { top: '0px', left: '0px' };
        transform = 'translate(-50%, -50%)';
        break;
      case 'n':
        positionStyle = { top: '0px', left: '50%' };
        transform = 'translate(-50%, -50%)';
        break;
      case 'ne':
        positionStyle = { top: '0px', right: '0px', left: 'auto' };
        transform = 'translate(50%, -50%)';
        break;
      case 'e':
        positionStyle = { top: '50%', right: '0px', left: 'auto' };
        transform = 'translate(50%, -50%)';
        break;
      case 'se':
        positionStyle = { bottom: '0px', right: '0px', top: 'auto', left: 'auto' };
        transform = 'translate(50%, 50%)';
        break;
      case 's':
        positionStyle = { bottom: '0px', left: '50%', top: 'auto' };
        transform = 'translate(-50%, 50%)';
        break;
      case 'sw':
        positionStyle = { bottom: '0px', left: '0px', top: 'auto' };
        transform = 'translate(-50%, 50%)';
        break;
      case 'w':
        positionStyle = { top: '50%', left: '0px' };
        transform = 'translate(-50%, -50%)';
        break;
    }
    
    return (
      <div 
        className={`resize-handle resize-handle-visible cursor-${cursorType} active:scale-125 transition-transform`}
        style={{ 
          ...handleStyle, 
          ...positionStyle, 
          transform,
          touchAction: 'none',  // Important for preventing scrolling during touch
        }}
        onMouseDown={(e) => {
          e.stopPropagation(); // Prevent canvas from receiving the click
          onResizeStart(e, direction);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Prevent canvas from receiving the touch event
          const touch = e.touches[0];
          
          // Create a more optimized synthetic event that includes only what's needed
          const syntheticEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault(),
            stopPropagation: () => e.stopPropagation(),
            target: e.target,
            currentTarget: e.currentTarget,
            type: 'mousedown',
          } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;
          
          onResizeStart(syntheticEvent, direction);
        }}
      />
    );
  };

  return (
    <>
      {createResizeHandle('nw', 'nw-resize', 'nw')}
      {createResizeHandle('n', 'n-resize', 'n')}
      {createResizeHandle('ne', 'ne-resize', 'ne')}
      {createResizeHandle('e', 'e-resize', 'e')}
      {createResizeHandle('se', 'se-resize', 'se')}
      {createResizeHandle('s', 's-resize', 's')}
      {createResizeHandle('sw', 'sw-resize', 'sw')}
      {createResizeHandle('w', 'w-resize', 'w')}
    </>
  );
};

export default ResizeHandles;
