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
    width: '10px',
    height: '10px',
    background: 'white',
    border: '2px solid #4F46E5',
    borderRadius: '50%',
    zIndex: 1001,
    pointerEvents: 'auto',
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
        className={`resize-handle resize-handle-visible cursor-${cursorType}`}
        style={{ 
          ...handleStyle, 
          ...positionStyle, 
          transform,
          touchAction: 'none',
        }}
        onMouseDown={(e) => onResizeStart(e, direction)}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          
          const syntheticEvent: ReactMouseEvent<HTMLDivElement, MouseEvent> = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault(),
            stopPropagation: () => e.stopPropagation(),
            target: e.target,
            currentTarget: e.currentTarget,
            type: 'mousedown',
            nativeEvent: e.nativeEvent,
            persist: () => {},
            altKey: false,
            button: 0,
            buttons: 1,
            ctrlKey: false,
            metaKey: false,
            movementX: 0,
            movementY: 0,
            pageX: touch.pageX,
            pageY: touch.pageY,
            screenX: touch.screenX,
            screenY: touch.screenY,
            shiftKey: false,
            view: window,
            detail: 0,
            pointerId: 0,
            pointerType: 'touch',
          } as ReactMouseEvent<HTMLDivElement, MouseEvent>;
          
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
