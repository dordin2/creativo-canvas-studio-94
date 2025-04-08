
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDesignState } from "@/context/DesignContext";

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
  const { messageBoxSettings } = useDesignState();
  
  // Determine modal position class based on settings
  const getPositionClasses = () => {
    switch (messageBoxSettings.position) {
      case 'top':
        return 'top-4 translate-y-0';
      case 'bottom':
        return 'bottom-4 translate-y-0';
      case 'center':
      default:
        return 'top-[50%] translate-y-[-50%]';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`left-[50%] translate-x-[-50%] ${getPositionClasses()} rounded-lg shadow-lg absolute overflow-visible`}
        style={{
          maxWidth: `${messageBoxSettings.width}px`,
          width: `${messageBoxSettings.width}px`,
          backgroundColor: messageBoxSettings.backgroundColor,
          color: messageBoxSettings.textColor,
          // Remove the modal overlay background to make it non-blocking
          position: 'fixed',
          zIndex: 50
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: messageBoxSettings.textColor }}>Message</DialogTitle>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-4 w-4" style={{ color: messageBoxSettings.textColor }} />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="py-4">
          <div 
            className="whitespace-pre-wrap"
            style={{ fontSize: `${messageBoxSettings.fontSize}px` }}
          >
            {message}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InteractionMessageModal;
