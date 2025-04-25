
import { useDesignState } from "@/context/DesignContext";
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import ElementProperties from "./properties/ElementProperties";
import NoElementSelected from "./properties/NoElementSelected";

const Properties = () => {
  const { activeElement } = useDesignState();
  const { isInteractiveMode } = useInteractiveMode();
  
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
