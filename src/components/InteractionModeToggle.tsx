
import React from "react";
import { useDesignState } from "@/context/DesignContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MousePointerClick } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const InteractionModeToggle = () => {
  const { isInteractionMode, toggleInteractionMode } = useDesignState();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <MousePointerClick className={`h-5 w-5 ${isInteractionMode ? 'text-canvas-purple' : 'text-gray-500'}`} />
            <Switch
              id="interaction-mode"
              checked={isInteractionMode}
              onCheckedChange={toggleInteractionMode}
            />
            <Label htmlFor="interaction-mode" className={`text-sm font-medium cursor-pointer ${isInteractionMode ? 'text-canvas-purple' : 'text-gray-500'}`}>
              Interaction Setup
            </Label>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isInteractionMode 
              ? 'Exit Interaction Setup Mode' 
              : 'Enter Interaction Setup Mode to configure element interactions'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InteractionModeToggle;
