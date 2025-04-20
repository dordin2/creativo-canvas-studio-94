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
    width: '12px',
    height: '12px',
    background: 'white',
    border: '2px solid #8B5CF6',
    borderRadius: '50%',
    zIndex: 1001,
    pointerEvents: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    transform: 'translate(-50%, -50%)',
  };

  const createResizeHandle = (position: string, cursorType: string, direction: string) => {
    let positionStyle: CSSProperties = {};
    
    switch (position) {
      case 'nw':
        positionStyle = { top: '0', left: '0' };
        break;
      case 'ne':
        positionStyle = { top: '0', right: '0' };
        break;
      case 'se':
        positionStyle = { bottom: '0', right: '0' };
        break;
      case 'sw':
        positionStyle = { bottom: '0', left: '0' };
        break;
    }
    
    return (
      <div 
        className="resize-handle resize-handle-visible"
        style={{ 
          ...handleStyle, 
          ...positionStyle, 
          cursor: cursorType,
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
            bubbles: true,
            cancelable: true,
            getModifierState: () => false,
            relatedTarget: null,
            which: 1,
            isPrimary: true,
            layerX: 0,
            layerY: 0,
          } as unknown as ReactMouseEvent<HTMLDivElement, MouseEvent>;
          
          onResizeStart(syntheticEvent, direction);
        }}
      />
    );
  };

  return (
    <>
      {createResizeHandle('nw', 'nw-resize', 'nw')}
      {createResizeHandle('ne', 'ne-resize', 'ne')}
      {createResizeHandle('se', 'se-resize', 'se')}
      {createResizeHandle('sw', 'sw-resize', 'sw')}
    </>
  );
};

export default ResizeHandles;
