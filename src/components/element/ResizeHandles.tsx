
import { CSSProperties } from "react";

interface ResizeHandlesProps {
  show: boolean;
  onResizeStart: (e: React.MouseEvent, direction: string) => void;
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
  };

  return (
    <>
      <div 
        className="resize-handle resize-handle-visible cursor-nw-resize"
        style={{ ...handleStyle, top: -6, left: -6 }}
        onMouseDown={(e) => onResizeStart(e, "nw")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-n-resize"
        style={{ ...handleStyle, top: -6, left: '50%', transform: 'translateX(-50%)' }}
        onMouseDown={(e) => onResizeStart(e, "n")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-ne-resize"
        style={{ ...handleStyle, top: -6, right: -6 }}
        onMouseDown={(e) => onResizeStart(e, "ne")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-e-resize"
        style={{ ...handleStyle, top: '50%', right: -6, transform: 'translateY(-50%)' }}
        onMouseDown={(e) => onResizeStart(e, "e")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-se-resize"
        style={{ ...handleStyle, bottom: -6, right: -6 }}
        onMouseDown={(e) => onResizeStart(e, "se")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-s-resize"
        style={{ ...handleStyle, bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
        onMouseDown={(e) => onResizeStart(e, "s")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-sw-resize"
        style={{ ...handleStyle, bottom: -6, left: -6 }}
        onMouseDown={(e) => onResizeStart(e, "sw")}
      />
      <div 
        className="resize-handle resize-handle-visible cursor-w-resize"
        style={{ ...handleStyle, top: '50%', left: -6, transform: 'translateY(-50%)' }}
        onMouseDown={(e) => onResizeStart(e, "w")}
      />
    </>
  );
};

export default ResizeHandles;
