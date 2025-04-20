
import { ElementsModal } from "./elements/ElementsModal";

const FloatingElementsButton = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <ElementsModal />
    </div>
  );
};

export default FloatingElementsButton;
