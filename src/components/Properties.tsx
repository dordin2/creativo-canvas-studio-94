
import { useDesignState } from "@/context/DesignContext";
import ElementProperties from "./properties/ElementProperties";
import NoElementSelected from "./properties/NoElementSelected";
import InteractionProperties from "./properties/InteractionProperties";

const Properties = () => {
  const { activeElement, isInteractionMode } = useDesignState();
  
  if (!activeElement) {
    return <NoElementSelected />;
  }
  
  if (isInteractionMode) {
    return <InteractionProperties element={activeElement} />;
  }
  
  return <ElementProperties element={activeElement} />;
};

export default Properties;
