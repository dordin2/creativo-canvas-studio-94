
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import { Switch } from "@/components/ui/switch";
import { Eye, Brush } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const InteractiveModeToggle = () => {
  const { isInteractiveMode, toggleInteractiveMode } = useInteractiveMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center relative">
            <Switch
              id="interactive-mode"
              checked={isInteractiveMode}
              onCheckedChange={toggleInteractiveMode}
              className="w-[72px] h-7"
            >
              <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                <Brush className={`h-5 w-5 transition-colors ${!isInteractiveMode ? 'text-canvas-purple' : 'text-gray-400'}`} />
              </div>
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <Eye className={`h-5 w-5 transition-colors ${isInteractiveMode ? 'text-canvas-purple' : 'text-gray-400'}`} />
              </div>
            </Switch>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isInteractiveMode 
              ? 'Exit Interactive Mode' 
              : 'Enter Style Mode'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InteractiveModeToggle;
