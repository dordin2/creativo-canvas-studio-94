
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import { Button } from "@/components/ui/button";
import { Pencil, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const InteractiveModeToggle = () => {
  const { isInteractiveMode, toggleInteractiveMode } = useInteractiveMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleInteractiveMode}
            className={isInteractiveMode ? 'text-canvas-purple' : 'text-gray-500 hover:text-gray-700'}
          >
            {isInteractiveMode ? (
              <Zap className="h-5 w-5" />
            ) : (
              <Pencil className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isInteractiveMode 
              ? 'Exit Interactive Mode' 
              : 'Enter Interactive Mode'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InteractiveModeToggle;
