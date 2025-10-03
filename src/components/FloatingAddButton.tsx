
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ElementMenuDialog } from "./ElementMenuDialog";

interface FloatingAddButtonProps {
  className?: string;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ className }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle both click and touch events
  const handleButtonPress = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <button
        type="button"
        title="הוסף אלמנט"
        onClick={handleButtonPress}
        className={cn(
          "fixed z-40 bottom-8 right-8 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center w-14 h-14 border-4 border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 touch-none",
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
