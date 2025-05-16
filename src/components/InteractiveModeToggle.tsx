import { useInteractiveMode } from "@/context/InteractiveModeContext";
import { Pencil, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
interface InteractiveModeToggleProps {
  isMobileNavigation?: boolean;
}
const InteractiveModeToggle = ({
  isMobileNavigation
}: InteractiveModeToggleProps = {}) => {
  const {
    isInteractiveMode,
    toggleInteractiveMode
  } = useInteractiveMode();
  const isMobile = useIsMobile();

  // For mobile navigation bar, we want a simpler button without tooltip
  if (isMobile && isMobileNavigation) {
    return <Button variant="ghost" size="icon" onClick={toggleInteractiveMode} className="aspect-square">
        {isInteractiveMode ? <Zap className="h-6 w-6 text-canvas-purple" /> : <Pencil className="h-6 w-6 text-gray-500" />}
        <span className="sr-only">
          {isInteractiveMode ? 'Switch to Design Mode' : 'Switch to Interactive Mode'}
        </span>
      </Button>;
  }

  // Standard desktop or non-navigation version with tooltip
  return <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isInteractiveMode ? 'Switch to Design Mode' : 'Switch to Interactive Mode'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>;
};
export default InteractiveModeToggle;