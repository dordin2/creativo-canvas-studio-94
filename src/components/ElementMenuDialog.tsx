
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
    <DialogContent className="fixed inset-4 sm:inset-8 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] max-w-4xl mx-auto h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] rounded-lg p-0 overflow-hidden bg-white shadow-2xl border border-gray-200">
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between border-b p-4 shadow-sm bg-white sticky top-0 z-50">
          <DialogHeader className="flex flex-row items-center gap-4 w-full">
            <DialogTitle className="text-xl sm:text-2xl text-canvas-purple font-bold">
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
        <div className="flex-1 overflow-y-auto p-4">
          <AdminGallery />
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
