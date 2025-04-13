
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

  // Use larger handles for mobile
  const handleSize = isMobile ? 16 : 10;
  
  const handleStyle: CSSProperties = {
    position: 'absolute',
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    background: 'white',
    border: '2px solid #4F46E5',
    borderRadius: '50%',
    zIndex: 1001,
    pointerEvents: 'auto',
    touchAction: 'none',
  };

  // Handle both touch and mouse events
  const handleStart = (e: React.MouseEvent | React.TouchEvent, direction: string) => {
    onResizeStart(e, direction);
  };

  return (
    <>
      <div 
        className="resize-handle resize-handle-visible cursor-nw-resize"
        style={{ ...handleStyle, top: '0px', left: '0px', transform: 'translate(-50%, -50%)' }}
        onMouseDown={(e) => handleStart(e, "nw")}
        onTouchStart={(e) => handleStart(e, "nw")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-n-resize"
        style={{ ...handleStyle, top: '0px', left: '50%', transform: 'translate(-50%, -50%)' }}
        onMouseDown={(e) => handleStart(e, "n")}
        onTouchStart={(e) => handleStart(e, "n")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-ne-resize"
        style={{ ...handleStyle, top: '0px', right: '0px', left: 'auto', transform: 'translate(50%, -50%)' }}
        onMouseDown={(e) => handleStart(e, "ne")}
        onTouchStart={(e) => handleStart(e, "ne")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-e-resize"
        style={{ ...handleStyle, top: '50%', right: '0px', left: 'auto', transform: 'translate(50%, -50%)' }}
        onMouseDown={(e) => handleStart(e, "e")}
        onTouchStart={(e) => handleStart(e, "e")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-se-resize"
        style={{ ...handleStyle, bottom: '0px', right: '0px', top: 'auto', left: 'auto', transform: 'translate(50%, 50%)' }}
        onMouseDown={(e) => handleStart(e, "se")}
        onTouchStart={(e) => handleStart(e, "se")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-s-resize"
        style={{ ...handleStyle, bottom: '0px', left: '50%', top: 'auto', transform: 'translate(-50%, 50%)' }}
        onMouseDown={(e) => handleStart(e, "s")}
        onTouchStart={(e) => handleStart(e, "s")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-sw-resize"
        style={{ ...handleStyle, bottom: '0px', left: '0px', top: 'auto', transform: 'translate(-50%, 50%)' }}
        onMouseDown={(e) => handleStart(e, "sw")}
        onTouchStart={(e) => handleStart(e, "sw")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-w-resize"
        style={{ ...handleStyle, top: '50%', left: '0px', transform: 'translate(-50%, -50%)' }}
        onMouseDown={(e) => handleStart(e, "w")}
        onTouchStart={(e) => handleStart(e, "w")}
      />
    </>
  );
};

export default ResizeHandles;
