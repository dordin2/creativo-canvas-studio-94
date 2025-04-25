
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InteractionMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  autoCloseDelay?: number;
}

const InteractionMessageModal = ({
  isOpen,
  onClose,
  message,
  title = "Message",
  autoCloseDelay = 0
}: InteractionMessageModalProps) => {
  const [open, setOpen] = useState(isOpen);
  
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (open && autoCloseDelay > 0) {
      timeoutId = setTimeout(() => {
        setOpen(false);
        onClose();
      }, autoCloseDelay);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [open, autoCloseDelay, onClose]);
  
  const handleClose = () => {
    setOpen(false);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={handleClose}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <DialogDescription className="whitespace-pre-line">
          {message}
        </DialogDescription>
        
        <div className="flex justify-end">
          <Button onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InteractionMessageModal;
