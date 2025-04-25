
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pencil, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const InteractiveModeToggle = () => {
  const { isInteractiveMode, toggleInteractiveMode } = useInteractiveMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {isInteractiveMode ? (
              <Zap className="h-5 w-5 text-canvas-purple" />
            ) : (
              <Pencil className="h-5 w-5 text-gray-500" />
            )}
            <Switch
              id="interactive-mode"
              checked={isInteractiveMode}
              onCheckedChange={toggleInteractiveMode}
            />
            <Label htmlFor="interactive-mode" className={`text-sm font-medium cursor-pointer ${isInteractiveMode ? 'text-canvas-purple' : 'text-gray-500'}`}>
              Interactive Mode
            </Label>
          </div>
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
