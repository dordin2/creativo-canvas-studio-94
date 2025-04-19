
import { DesignElement } from "@/context/DesignContext";
import InteractionIcons from "./InteractionIcons";

interface InteractionContextMenuProps {
  element: DesignElement;
  children: React.ReactNode;
}

const InteractionContextMenu = ({ element, children }: InteractionContextMenuProps) => {
  return (
    <div className="relative group">
      {children}
      <InteractionIcons element={element} />
    </div>
  );
};

export default InteractionContextMenu;
