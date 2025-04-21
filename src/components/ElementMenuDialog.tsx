
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

interface ElementMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ElementMenuDialog: React.FC<ElementMenuDialogProps> = ({
  open,
  onOpenChange,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      // Ensure dialog covers whole viewport, always has top padding
      className="fixed w-full max-w-none h-full max-h-none rounded-none p-0 overflow-y-auto bg-white !top-0 !left-0"
      style={{ inset: 0, paddingTop: 20, paddingBottom: 20 }}
    >
      <div className="flex flex-col h-full min-h-[calc(100vh-40px)] bg-white">
        <div className="flex items-center justify-between border-b p-4 shadow-sm bg-white sticky top-0 z-10">
          <DialogHeader className="flex flex-row items-center gap-4 w-full">
            <DialogTitle className="text-2xl text-canvas-purple font-bold">
              הוספת אלמנט - תפריט הספרייה
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
        <div className="flex-1 overflow-y-auto px-2 pt-4 pb-8">
          <AdminGallery />
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

