
import { DesignElement } from "@/types/designTypes";
import InteractionIcons from "@/components/element/InteractionIcons";

interface MobileInteractionControlsProps {
  element: DesignElement;
}

const MobileInteractionControls = ({ element }: MobileInteractionControlsProps) => {
  return (
    <div className="sticky top-0 bg-background z-50 px-4 py-2 border-b">
      <InteractionIcons element={element} />
    </div>
  );
};

export default MobileInteractionControls;
