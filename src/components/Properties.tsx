
import { useDesignState } from "@/context/DesignContext";
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import ElementProperties from "./properties/ElementProperties";
import NoElementSelected from "./properties/NoElementSelected";

const Properties = () => {
  const { activeElement, isGameMode } = useDesignState();
  const { isInteractiveMode } = useInteractiveMode();
  
  // Don't show properties in game mode
  if (isGameMode) {
    return null;
  }
  
  if (!activeElement) {
    return <NoElementSelected />;
  }
  
  return (
    <ElementProperties 
      element={activeElement} 
      isInteractiveMode={isInteractiveMode} 
    />
  );
};

export default Properties;
