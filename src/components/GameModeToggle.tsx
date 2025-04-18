
import React from "react";
import { useDesignState } from "@/context/DesignContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play } from "lucide-react";

const GameModeToggle = () => {
  const { isGameMode, toggleGameMode } = useDesignState();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger 
          asChild 
          onClick={toggleGameMode}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-4 mr-4">
            <Play 
              className={`h-5 w-5 ${isGameMode ? 'text-canvas-purple' : 'text-gray-500'}`} 
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isGameMode 
              ? 'Exit Play Preview (Game state will be preserved)' 
              : 'Enter Play Preview (Inventory items will be remembered)'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GameModeToggle;
