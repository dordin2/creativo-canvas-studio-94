
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ElementMenuDialog } from "./ElementMenuDialog";

interface FloatingAddButtonProps {
  className?: string;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ className }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="הוסף אלמנט"
        onClick={() => setIsDialogOpen(true)}
        className={cn(
          "fixed z-40 bottom-8 right-8 bg-canvas-purple text-white rounded-full shadow-lg hover:bg-canvas-purple-dark transition-colors duration-200 flex items-center justify-center w-14 h-14 border-4 border-white outline-none focus:ring-2 focus:ring-canvas-purple-dark",
          className
        )}
        aria-label="Add element"
      >
        <Plus size={32} />
      </button>
      
      <ElementMenuDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
};

export default FloatingAddButton;

