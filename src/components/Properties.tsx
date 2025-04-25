
import { useDesignState } from "@/context/DesignContext";
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import ElementProperties from "./properties/ElementProperties";
import NoElementSelected from "./properties/NoElementSelected";

const Properties = () => {
  const { activeElement, showInteractionPanel } = useDesignState();
  const { isInteractiveMode } = useInteractiveMode();
  
  if (!activeElement) {
    return <NoElementSelected />;
  }
  
  if (isInteractiveMode && !showInteractionPanel) {
    return null;
  }
  
  return (
    <ElementProperties 
      element={activeElement} 
      isInteractiveMode={isInteractiveMode} 
    />
  );
};

export default Properties;
