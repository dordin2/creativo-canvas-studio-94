
import { DesignElement } from "@/types/designTypes";
import InteractionIcons from "@/components/element/InteractionIcons";

interface MobileInteractionControlsProps {
  element: DesignElement;
}

const MobileInteractionControls = ({ element }: MobileInteractionControlsProps) => {
  return (
    <div className="relative px-4 py-2">
      <InteractionIcons element={element} />
    </div>
  );
};

export default MobileInteractionControls;
