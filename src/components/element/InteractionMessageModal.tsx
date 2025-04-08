
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
  position = 'top', // Default to top now
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
    
    // Calculate the center of the element
    const centerX = elementRect.left + elementRect.width / 2;
    
    // Position exactly at the top/bottom of the element (not with offset)
    const positionY = position === 'bottom' 
      ? elementRect.bottom // Exactly at the bottom of element
      : elementRect.top;   // Exactly at the top of element
    
    return {
      left: `${centerX}px`,
      transform: 'translateX(-50%)',
      // For top position, place the bottom of the bubble at the element top
      // For bottom position, place the top of the bubble at the element bottom
      [position === 'bottom' ? 'top' : 'bottom']: `calc(100% - ${positionY}px)`
    };
  };
  
  const positionStyles = getPositionStyles();
  
  // Calculate the proper position for the bubble pointer triangle
  const bubblePosition = position === 'bottom' ? '-bottom-1' : '-top-1';
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
