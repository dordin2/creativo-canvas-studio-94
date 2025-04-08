
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InteractionMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const InteractionMessageModal: React.FC<InteractionMessageModalProps> = ({ 
  isOpen, 
  onClose, 
  message
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
  
  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-md w-full px-4 transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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
      </div>
    </div>
  );
};

export default InteractionMessageModal;
