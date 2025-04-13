
import { CSSProperties } from "react";
import { useDesignState } from "@/context/DesignContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResizeHandlesProps {
  show: boolean;
  onResizeStart: (e: React.MouseEvent | React.TouchEvent, direction: string) => void;
}

const ResizeHandles = ({ show, onResizeStart }: ResizeHandlesProps) => {
  const { isGameMode } = useDesignState();
  const isMobile = useIsMobile();
  
  // Don't show resize handles in game mode
  if (!show || isGameMode) return null;

  const handleSize = isMobile ? '18px' : '10px';
  const borderSize = isMobile ? '3px' : '2px';

  const handleStyle: CSSProperties = {
    position: 'absolute',
    width: handleSize,
    height: handleSize,
    background: 'white',
    border: `${borderSize} solid #4F46E5`,
    borderRadius: '50%',
    zIndex: 1001,
    pointerEvents: 'auto',
    touchAction: 'none',
  };

  const handleEvents = (direction: string) => ({
    onMouseDown: (e: React.MouseEvent) => onResizeStart(e, direction),
    onTouchStart: (e: React.TouchEvent) => onResizeStart(e, direction)
  });

  return (
    <>
      <div 
        className="resize-handle resize-handle-visible cursor-nw-resize"
        style={{ ...handleStyle, top: '0px', left: '0px', transform: 'translate(-50%, -50%)' }}
        {...handleEvents("nw")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-n-resize"
        style={{ ...handleStyle, top: '0px', left: '50%', transform: 'translate(-50%, -50%)' }}
        {...handleEvents("n")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-ne-resize"
        style={{ ...handleStyle, top: '0px', right: '0px', left: 'auto', transform: 'translate(50%, -50%)' }}
        {...handleEvents("ne")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-e-resize"
        style={{ ...handleStyle, top: '50%', right: '0px', left: 'auto', transform: 'translate(50%, -50%)' }}
        {...handleEvents("e")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-se-resize"
        style={{ ...handleStyle, bottom: '0px', right: '0px', top: 'auto', left: 'auto', transform: 'translate(50%, 50%)' }}
        {...handleEvents("se")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-s-resize"
        style={{ ...handleStyle, bottom: '0px', left: '50%', top: 'auto', transform: 'translate(-50%, 50%)' }}
        {...handleEvents("s")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-sw-resize"
        style={{ ...handleStyle, bottom: '0px', left: '0px', top: 'auto', transform: 'translate(-50%, 50%)' }}
        {...handleEvents("sw")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-w-resize"
        style={{ ...handleStyle, top: '50%', left: '0px', transform: 'translate(-50%, -50%)' }}
        {...handleEvents("w")}
      />
    </>
  );
};

export default ResizeHandles;
