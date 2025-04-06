
import React from 'react';

interface InteractionMessageProps {
  config: {
    text: string;
    color?: string;
    position?: string;
  };
}

const InteractionMessage: React.FC<InteractionMessageProps> = ({ config }) => {
  const { text, color = '#000000', position = 'center' } = config;
  
  let positionStyle = {};
  switch (position) {
    case 'top':
      positionStyle = { top: 0, left: '50%', transform: 'translateX(-50%)' };
      break;
    case 'bottom':
      positionStyle = { bottom: 0, left: '50%', transform: 'translateX(-50%)' };
      break;
    case 'center':
    default:
      positionStyle = { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)' 
      };
      break;
  }
  
  return (
    <div 
      className="absolute z-50 px-4 py-2 rounded-md bg-white shadow-lg animate-fade-in font-medium"
      style={{
        ...positionStyle,
        color,
        maxWidth: '90%',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      {text}
    </div>
  );
};

export default InteractionMessage;
