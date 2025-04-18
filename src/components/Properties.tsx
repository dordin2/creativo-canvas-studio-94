
import { useDesignState } from "@/context/DesignContext";
import ElementProperties from "./properties/ElementProperties";
import NoElementSelected from "./properties/NoElementSelected";
import InteractionProperties from "./properties/InteractionProperties";

const Properties = () => {
  const { activeElement } = useDesignState();
  
  if (!activeElement) {
    return <NoElementSelected />;
  }
  
  return <ElementProperties element={activeElement} />;
};

export default Properties;
