
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, ArrowLeft } from "lucide-react";
import { useGameModeNavigation } from "@/hooks/useGameModeNavigation";

/**
 * GameModeToggle: switches between Game (Play) and Editor modes with navigation and url change.
 */
const GameModeToggle = () => {
  const { goToPlayMode, goToEditor, isInGameModeRoute } = useGameModeNavigation();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          asChild
          onClick={isInGameModeRoute ? goToEditor : goToPlayMode}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-4 mr-4">
            {isInGameModeRoute
              ? <ArrowLeft className="h-5 w-5 text-canvas-purple" />
              : <Play className="h-5 w-5 text-gray-500" />
            }
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isInGameModeRoute
              ? 'חזור לעורך (Editor)'
              : 'פתיחת תצוגת משחק (Play) בלינק נפרד'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GameModeToggle;
