
import { useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import ElementProperties from "./properties/ElementProperties";
import NoElementSelected from "./properties/NoElementSelected";

const Properties = () => {
  const { activeElement } = useDesignState();
  const { isInteractiveMode } = useInteractiveMode();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (!activeElement) {
    return <NoElementSelected />;
  }
  
  return (
    <ElementProperties 
      element={activeElement} 
      isInteractiveMode={isInteractiveMode}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    />
  );
};

export default Properties;
