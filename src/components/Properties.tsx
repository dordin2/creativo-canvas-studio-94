
import { useDesignState } from "@/context/DesignContext";
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import ElementProperties from "./properties/ElementProperties";
import NoElementSelected from "./properties/NoElementSelected";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const Properties = () => {
  const { activeElement, showInteractionPanel, setShowInteractionPanel } = useDesignState();
  const { isInteractiveMode } = useInteractiveMode();
  
  if (!activeElement) {
    return <NoElementSelected />;
  }
  
  if (isInteractiveMode && !showInteractionPanel) {
    return null;
  }
  
  return (
    <Sheet open={showInteractionPanel} onOpenChange={setShowInteractionPanel}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 pt-12">
        <ElementProperties 
          element={activeElement} 
          isInteractiveMode={isInteractiveMode} 
        />
      </SheetContent>
    </Sheet>
  );
};

export default Properties;
