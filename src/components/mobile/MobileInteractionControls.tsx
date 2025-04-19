
import { DesignElement } from "@/types/designTypes";
import InteractionProperties from "@/components/properties/InteractionProperties";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileInteractionControlsProps {
  element: DesignElement;
}

const MobileInteractionControls = ({ element }: MobileInteractionControlsProps) => {
  return (
    <div className="relative">
      <ScrollArea className="h-[40vh] overflow-y-auto pb-safe">
        <div className="px-4 py-2">
          <InteractionProperties element={element} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default MobileInteractionControls;
