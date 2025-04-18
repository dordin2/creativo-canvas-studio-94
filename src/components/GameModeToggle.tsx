
import React from "react";
import { useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Gamepad2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const GameModeToggle = () => {
  const { isGameMode, toggleGameMode } = useDesignState();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-4 mr-4">
            <Gamepad2 className={`h-5 w-5 ${isGameMode ? 'text-canvas-purple' : 'text-gray-500'}`} />
            <Switch
              id="game-mode"
              checked={isGameMode}
              onCheckedChange={toggleGameMode}
            />
            <Label htmlFor="game-mode" className={`text-sm font-medium cursor-pointer ${isGameMode ? 'text-canvas-purple' : 'text-gray-500'}`}>
              Game Mode
            </Label>
          </div>
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
