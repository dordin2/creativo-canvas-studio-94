
import { CSSProperties } from "react";
import { useDesignState } from "@/context/DesignContext";

interface ResizeHandlesProps {
  show: boolean;
  onResizeStart: (e: React.MouseEvent, direction: string) => void;
}

const ResizeHandles = ({ show, onResizeStart }: ResizeHandlesProps) => {
  const { isGameMode } = useDesignState();
  
  // Don't show resize handles in game mode
  if (!show || isGameMode) return null;

  const handleStyle: CSSProperties = {
    position: 'absolute',
    width: '10px',
    height: '10px',
    background: 'white',
    border: '2px solid #4F46E5',
    borderRadius: '50%',
    zIndex: 1001,
    pointerEvents: 'auto',
  };

  // Helper function to create handles with better touch targets
  const createResizeHandle = (position: string, cursorType: string, direction: string) => {
    // Define positioning based on handle location
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
        className={`resize-handle resize-handle-visible cursor-${cursorType}`}
        style={{ 
          ...handleStyle, 
          ...positionStyle, 
          transform,
          // Touch area improvement
          touchAction: 'none',
        }}
        onMouseDown={(e) => onResizeStart(e, direction)}
        onTouchStart={(e) => {
          // Prevent scrolling when using handles on touch devices
          e.preventDefault();
          const touch = e.touches[0];
          // Create a React compatible MouseEvent using the properties from TouchEvent
          // Use the correct React.MouseEvent type instead of native MouseEvent
          const syntheticEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {},
            stopPropagation: () => {},
            target: e.target,
            currentTarget: e.currentTarget,
            bubbles: true,
            type: 'mousedown',
          } as React.MouseEvent;
          
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
