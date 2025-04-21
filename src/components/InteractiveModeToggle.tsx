
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const InteractiveModeToggle = () => {
  const { isInteractiveMode, toggleInteractiveMode } = useInteractiveMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Eye className={`h-5 w-5 ${isInteractiveMode ? 'text-canvas-purple' : 'text-gray-500'}`} />
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
              ? 'Exit Interactive Mode' 
              : 'Enter Interactive Mode'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InteractiveModeToggle;
