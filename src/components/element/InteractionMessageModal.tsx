
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
  position = 'top',
  elementRect
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // Auto-close after 3 seconds
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
  
  // Calculate position based on element rectangle
  let style: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 30,
    maxWidth: '20rem',
    width: '100%',
    padding: '0 1rem'
  };
  
  // If we have elementRect, position directly above or below the element
  if (elementRect) {
    const elementCenterX = elementRect.left + elementRect.width / 2;
    
    if (position === 'top') {
      style = {
        ...style,
        left: `${elementCenterX}px`,
        top: `${elementRect.top - 10}px`
      };
    } else {
      style = {
        ...style,
        left: `${elementCenterX}px`,
        top: `${elementRect.bottom + 10}px`
      };
    }
  } else {
    // Fallback to default positioning
    style = {
      ...style,
      [position === 'bottom' ? 'bottom' : 'top']: '2rem'
    };
  }
  
  return (
    <div 
      className={`transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={style}
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
        
        {/* Triangle pointer at the bottom */}
        <div className={`absolute left-1/2 ${position === 'top' ? 'bottom-0 rotate-45 translate-y-1/2' : 'top-0 -rotate-135 -translate-y-1/2'} w-4 h-4 bg-black/80 transform -translate-x-1/2 border-r border-b border-gray-700`}></div>
      </div>
    </div>
  );
};

export default InteractionMessageModal;
