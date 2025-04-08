
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InteractionMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  position?: 'bottom' | 'top';
}

const InteractionMessageModal: React.FC<InteractionMessageModalProps> = ({ 
  isOpen, 
  onClose, 
  message,
  position = 'bottom'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match the transition duration
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  if (!isVisible && !isOpen) return null;
  
  return (
    <div 
      className={`fixed left-1/2 transform -translate-x-1/2 z-30 max-w-md w-full px-4
        ${position === 'bottom' ? 'bottom-8' : 'top-8'}
        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        transition-all duration-300 ease-in-out`}
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
        <div className="absolute left-1/2 bottom-0 w-4 h-4 bg-black/80 transform -translate-x-1/2 translate-y-1/2 rotate-45 border-r border-b border-gray-700"></div>
      </div>
    </div>
  );
};

export default InteractionMessageModal;
