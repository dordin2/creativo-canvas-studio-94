
import { DesignElement } from "@/types/designTypes";
import { ScrollArea } from "@/components/ui/scroll-area";
import InteractionIconMenu from "./InteractionIconMenu";
import InteractionSettingsPanel from "./InteractionSettingsPanel";
import { useState } from "react";

interface MobileInteractionControlsProps {
  element: DesignElement;
}

const MobileInteractionControls = ({ element }: MobileInteractionControlsProps) => {
  const [selectedInteractionType, setSelectedInteractionType] = useState<string | null>(null);

  return (
    <div className="relative">
      <ScrollArea className="h-[40vh] overflow-y-auto pb-safe">
        <InteractionIconMenu 
          onSelectInteractionType={(type) => setSelectedInteractionType(type)} 
        />
      </ScrollArea>

      <InteractionSettingsPanel
        isOpen={!!selectedInteractionType}
        onClose={() => setSelectedInteractionType(null)}
        element={element}
        interactionType={selectedInteractionType || 'none'}
      />
    </div>
  );
};

export default MobileInteractionControls;
