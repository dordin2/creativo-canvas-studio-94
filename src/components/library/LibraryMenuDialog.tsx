
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
import { PublicUploader } from "./PublicUploader";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { DesignProvider } from "@/context/DesignContext";
import { useAuth } from "@/context/AuthContext";
import { syncLibraryWithStorage } from "@/utils/librarySync";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = React.useState(false);
  
  const preventZoom = React.useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, []);

  // Auto-sync when dialog opens
  React.useEffect(() => {
    if (open && !isSyncing) {
      setIsSyncing(true);
      syncLibraryWithStorage()
        .then((success) => {
          if (success) {
            queryClient.invalidateQueries({ queryKey: ['library-images'] });
          }
        })
        .catch((error) => {
          console.error("Error syncing library:", error);
          toast.error("Failed to synchronize library");
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  }, [open, queryClient, isSyncing]);

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

  // Define an empty initial state for the DesignProvider
  const emptyInitialState = {
    canvases: [],
    activeCanvasIndex: 0,
    isGameMode: false
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 gap-0 overflow-hidden flex flex-col",
        isMobile ? "w-[95vw] max-w-full h-[90vh]" : "max-w-4xl w-[90vw] h-[80vh]"
      )}>
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
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

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="border-b mx-4 flex-shrink-0">
              <TabsTrigger value="library">Browse Library</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
            </TabsList>
            
            <div className="flex-1 min-h-0">
              <DesignProvider initialState={emptyInitialState}>
                <TabsContent value="library" className="h-full m-0">
                  <LibraryView onClose={() => onOpenChange(false)} autoSync={true} />
                </TabsContent>
                <TabsContent value="upload" className="h-full m-0">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <PublicUploader />
                    </div>
                  </ScrollArea>
                </TabsContent>
                {isAdmin && (
                  <TabsContent value="admin" className="h-full m-0">
                    <AdminLibraryView onClose={() => onOpenChange(false)} />
                  </TabsContent>
                )}
              </DesignProvider>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

