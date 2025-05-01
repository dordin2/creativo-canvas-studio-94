
import React, { Suspense, lazy } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Lazy load the LibraryView component
const LibraryView = lazy(() => import("./LibraryView").then(module => ({
  default: module.LibraryView
})));

interface LibraryMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LibraryMenuDialog: React.FC<LibraryMenuDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();
  
  const preventZoom = React.useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, []);

  React.useEffect(() => {
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
              <Suspense fallback={
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-canvas-purple" />
                  <p className="ml-2 text-muted-foreground">Loading library...</p>
                </div>
              }>
                <LibraryView onClose={() => onOpenChange(false)} />
              </Suspense>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
