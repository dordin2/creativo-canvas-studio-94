
import { CSSProperties } from "react";
import { useDesignState } from "@/context/DesignContext";

interface RotationHandleProps {
  show: boolean;
  onRotateStart: (e: React.MouseEvent) => void;
}

const RotationHandle = ({ show, onRotateStart }: RotationHandleProps) => {
  const { isGameMode } = useDesignState();
  
  // Don't show rotation handle in game mode
  if (!show || isGameMode) return null;

  const handleStyle: CSSProperties = {
    position: 'absolute',
    width: '24px',
    height: '24px',
    background: 'white',
    border: '2px solid #4F46E5',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: -40,
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'grab',
    zIndex: 1001,
    pointerEvents: 'auto',
    touchAction: 'none', // Prevent default touch actions
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  const lineStyle: CSSProperties = {
    position: 'absolute',
    width: '2px',
    height: '20px',
    background: '#4F46E5',
    top: -20,
    left: 'calc(50% - 1px)',
    pointerEvents: 'none',
  };

  // Handle touch start event separately
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent default touch behavior to avoid scrolling
    e.preventDefault();
    
    // Extract the touch position and pass it to the rotation handler
    const touch = e.touches[0];
    
    // Create a synthetic-like event object with the properties we need
    const touchPoint = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      currentTarget: e.currentTarget,
      target: e.target,
      preventDefault: () => {},
      stopPropagation: () => {},
    };
    
    // Call the rotation start handler with our custom event object
    onRotateStart(touchPoint as unknown as React.MouseEvent);
  };

  return (
    <>
      <div style={lineStyle} />
      <div 
        className="rotation-handle rotation-handle-visible"
        style={handleStyle}
        onMouseDown={onRotateStart}
        onTouchStart={handleTouchStart}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 15C4 16.0609 4.42143 17.0783 5.17157 17.8284C5.92172 18.5786 6.93913 19 8 19H16C17.0609 19 18.0783 18.5786 18.8284 17.8284C19.5786 17.0783 20 16.0609 20 15V9C20 7.93913 19.5786 6.92172 18.8284 6.17157C18.0783 5.42143 17.0609 5 16 5H8C6.93913 5 5.92172 5.42143 5.17157 6.17157C4.42143 6.92172 4 7.93913 4 9" 
            stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 3V7M9 5L12 8L15 5" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </>
  );
};

export default RotationHandle;
