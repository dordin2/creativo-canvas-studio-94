
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { AdminGallery } from "./AdminGallery";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ElementMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ElementMenuDialog: React.FC<ElementMenuDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();

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
  }, [open]);

  const preventZoom = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 w-screen h-screen max-w-none p-0 m-0 overflow-hidden border-none rounded-none bg-white" style={{ transform: "none" }}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b shadow-sm bg-white sticky top-0 z-50">
            <DialogHeader className="flex flex-row items-center gap-4 w-full">
              <DialogTitle className="text-xl sm:text-2xl text-canvas-purple font-bold">
                ניהול ספריית האלמנטים
              </DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <button
                className="text-gray-700 hover:text-canvas-purple transition-colors"
                aria-label="סגור תפריט"
              >
                <X size={28} />
              </button>
            </DialogClose>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <AdminGallery />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
