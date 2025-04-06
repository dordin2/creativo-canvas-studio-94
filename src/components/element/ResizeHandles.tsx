
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
    transform: 'translate(-50%, -50%)',
  };

  return (
    <>
      <div 
        className="resize-handle resize-handle-visible cursor-nw-resize"
        style={{ ...handleStyle, top: 0, left: 0, transform: 'none' }}
        onMouseDown={(e) => onResizeStart(e, "nw")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-n-resize"
        style={{ ...handleStyle, top: 0, left: '50%' }}
        onMouseDown={(e) => onResizeStart(e, "n")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-ne-resize"
        style={{ ...handleStyle, top: 0, right: 0, left: 'auto', transform: 'none' }}
        onMouseDown={(e) => onResizeStart(e, "ne")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-e-resize"
        style={{ ...handleStyle, top: '50%', right: 0, left: 'auto', transform: 'translate(0, -50%)' }}
        onMouseDown={(e) => onResizeStart(e, "e")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-se-resize"
        style={{ ...handleStyle, bottom: 0, right: 0, top: 'auto', left: 'auto', transform: 'none' }}
        onMouseDown={(e) => onResizeStart(e, "se")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-s-resize"
        style={{ ...handleStyle, bottom: 0, left: '50%', top: 'auto', transform: 'translate(-50%, 0)' }}
        onMouseDown={(e) => onResizeStart(e, "s")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-sw-resize"
        style={{ ...handleStyle, bottom: 0, left: 0, top: 'auto', transform: 'none' }}
        onMouseDown={(e) => onResizeStart(e, "sw")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-w-resize"
        style={{ ...handleStyle, top: '50%', left: 0, transform: 'translate(0, -50%)' }}
        onMouseDown={(e) => onResizeStart(e, "w")}
      />
    </>
  );
};

export default ResizeHandles;
