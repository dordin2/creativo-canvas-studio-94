
import React from "react";
import { useDesignState } from "@/context/DesignContext";
import { Play } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const GameModeToggle = () => {
  const { isGameMode, toggleGameMode } = useDesignState();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleGameMode}
            className="hover:bg-gray-100"
          >
            <Play className={`h-5 w-5 ${isGameMode ? 'text-canvas-purple' : 'text-gray-500'}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isGameMode 
              ? 'Exit Game Mode (Game state will be preserved)' 
              : 'Enter Game Mode (Inventory items will be remembered)'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GameModeToggle;

