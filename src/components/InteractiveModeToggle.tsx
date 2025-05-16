
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import { Pencil, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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
            className="hover:bg-gray-100"
          >
            {isInteractiveMode ? (
              <Zap className="h-5 w-5 text-canvas-purple" />
            ) : (
              <Pencil className="h-5 w-5 text-gray-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isInteractiveMode 
              ? 'Switch to Design Mode' 
              : 'Switch to Interactive Mode'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InteractiveModeToggle;

