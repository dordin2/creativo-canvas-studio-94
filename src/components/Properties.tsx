
import { useDesignState } from "@/context/DesignContext";
import ElementProperties from "./properties/ElementProperties";
import NoElementSelected from "./properties/NoElementSelected";
import InteractionProperties from "./properties/InteractionProperties";

const Properties = () => {
  const { activeElement, isInteractionMode } = useDesignState();
  
  if (!activeElement) {
    return <NoElementSelected />;
  }
  
  // Show either interaction properties or regular properties based on mode
  return isInteractionMode ? 
    <InteractionProperties element={activeElement} /> : 
    <ElementProperties element={activeElement} />;
};

export default Properties;
