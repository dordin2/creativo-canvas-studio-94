
import React from 'react';

interface InteractionMessageProps {
  config: {
    text: string;
    color?: string;
    position?: 'top' | 'center' | 'bottom';
  };
}

const InteractionMessage: React.FC<InteractionMessageProps> = ({ config }) => {
  const { text, color = '#000000', position = 'bottom' } = config;
  
  let positionStyle = {};
  switch (position) {
    case 'top':
      positionStyle = { top: 0, left: '50%', transform: 'translateX(-50%)' };
      break;
    case 'bottom':
    default:
      positionStyle = { bottom: '10%', left: '50%', transform: 'translateX(-50%)' };
      break;
    case 'center':
      positionStyle = { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)' 
      };
      break;
  }
  
  return (
    <div 
      className="fixed z-50 px-6 py-4 rounded-md bg-white shadow-lg animate-fade-in font-medium"
      style={{
        ...positionStyle,
        color,
        maxWidth: '90%',
        textAlign: 'center',
        pointerEvents: 'none',
        fontSize: '1.25rem',
      }}
    >
      {text}
    </div>
  );
};

export default InteractionMessage;
