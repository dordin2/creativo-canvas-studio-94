
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import { Button } from "@/components/ui/button";
import { Brush, Zap } from "lucide-react";
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
            className="relative"
          >
            {isInteractiveMode ? (
              <Zap className="h-5 w-5 text-canvas-purple transition-colors" />
            ) : (
              <Brush className="h-5 w-5 text-canvas-purple transition-colors" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isInteractiveMode 
              ? 'חזרה למצב עריכה'
              : 'מעבר למצב אינטראקטיבי'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InteractiveModeToggle;
