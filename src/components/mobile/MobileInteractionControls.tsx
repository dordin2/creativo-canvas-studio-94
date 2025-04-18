
import { DesignElement } from "@/types/designTypes";
import InteractionProperties from "@/components/properties/InteractionProperties";

interface MobileInteractionControlsProps {
  element: DesignElement;
}

const MobileInteractionControls = ({ element }: MobileInteractionControlsProps) => {
  return (
    <div className="px-4 py-2">
      <InteractionProperties element={element} />
    </div>
  );
};

export default MobileInteractionControls;
