import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { AdminLibraryView } from "./AdminLibraryView";
import { LibraryView } from "./LibraryView";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface LibraryMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LibraryMenuDialog: React.FC<LibraryMenuDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = React.useState("library");
  
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

          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="border-b mx-4">
                <TabsTrigger value="library">Public Library</TabsTrigger>
                <TabsTrigger value="uploads">Your Uploads</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="flex-1">
                <TabsContent value="library" className="p-4 h-full">
                  <LibraryView onClose={() => onOpenChange(false)} />
                </TabsContent>
                <TabsContent value="uploads" className="p-4 h-full">
                  <AdminLibraryView onClose={() => onOpenChange(false)} />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
