
import React, { CSSProperties } from "react";
import { RotateCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RotationHandleProps {
  show: boolean;
  onRotateStart: (e: React.MouseEvent | React.TouchEvent) => void;
}

const RotationHandle = ({ show, onRotateStart }: RotationHandleProps) => {
  const isMobile = useIsMobile();
  
  if (!show) return null;

  const handleSize = isMobile ? '22px' : '16px';
  const handleStyle: CSSProperties = {
    position: 'absolute',
    top: '-32px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: handleSize,
    height: handleSize,
    background: '#4F46E5',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    cursor: 'grab',
    zIndex: 1001,
    pointerEvents: 'auto',
    touchAction: 'none',
  };

  const handleEvents = {
    onMouseDown: onRotateStart,
    onTouchStart: onRotateStart
  };

  return (
    <div 
      className="rotation-handle"
      style={handleStyle}
      {...handleEvents}
    >
      <RotateCw size={isMobile ? 14 : 12} />
    </div>
  );
};

export default RotationHandle;
