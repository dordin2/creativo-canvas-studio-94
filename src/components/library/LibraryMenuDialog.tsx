
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { AdminLibraryView } from "./AdminLibraryView";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useDesignState } from "@/context/DesignContext";
import { LibraryView } from "./LibraryView";

interface LibraryMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LibraryMenuDialog: React.FC<LibraryMenuDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();
  const { activeElement } = useDesignState();
  
  const preventZoom = React.useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("wheel", preventZoom, { passive: false });
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("wheel", preventZoom);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("wheel", preventZoom);
    };
  }, [open, preventZoom]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 gap-0 overflow-hidden",
        isMobile ? "w-[95vw] max-w-full" : "max-w-4xl w-[90vw]"
      )} style={{ height: "600px" }}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <DialogHeader className="flex flex-row items-center gap-4">
              <DialogTitle className="text-xl text-canvas-purple font-bold">
                Library Elements
              </DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <button
                className="text-gray-700 hover:text-canvas-purple transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </DialogClose>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <LibraryView onClose={() => onOpenChange(false)} />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
