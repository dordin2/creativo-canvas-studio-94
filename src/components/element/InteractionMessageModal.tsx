
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InteractionMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  position?: 'bottom' | 'top';
  elementRect?: DOMRect | null;
}

const InteractionMessageModal: React.FC<InteractionMessageModalProps> = ({ 
  isOpen, 
  onClose, 
  message,
  position = 'bottom',
  elementRect
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match the transition duration
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
  
  if (!isVisible && !isOpen) return null;
  
  // Get position styles based on the element's rect
  const getPositionStyles = () => {
    if (!elementRect) {
      return {
        left: '50%',
        transform: 'translateX(-50%)',
        [position === 'bottom' ? 'bottom' : 'top']: '8rem'
      };
    }
    
    const centerX = elementRect.left + elementRect.width / 2;
    const positionY = position === 'bottom' 
      ? elementRect.bottom + 10 // 10px below element
      : elementRect.top - 10;   // 10px above element
    
    return {
      left: `${centerX}px`,
      transform: 'translateX(-50%)',
      [position === 'bottom' ? 'top' : 'bottom']: `calc(100% - ${positionY}px)`
    };
  };
  
  const positionStyles = getPositionStyles();
  const bubblePosition = elementRect ? 
    (position === 'bottom' ? '-bottom-1' : '-top-1') : 
    (position === 'bottom' ? 'bottom-0' : 'top-0');
  const bubbleRotation = position === 'bottom' ? 'rotate-45' : '-rotate-135';
  
  return (
    <div 
      className="fixed z-30 max-w-md w-full px-4"
      style={{
        ...positionStyles,
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <div className="bg-black/80 text-white rounded-lg p-4 shadow-lg border border-gray-700 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        
        <div className="pt-2 pb-1">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message}
          </div>
        </div>
        
        {/* Triangle pointer */}
        <div className={`absolute left-1/2 ${bubblePosition} w-4 h-4 bg-black/80 transform -translate-x-1/2 ${bubbleRotation} border-r border-b border-gray-700`}></div>
      </div>
    </div>
  );
};

export default InteractionMessageModal;
