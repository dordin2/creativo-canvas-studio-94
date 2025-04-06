
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message</DialogTitle>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="py-4">
          <div className="whitespace-pre-wrap">
            {message}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InteractionMessageModal;
