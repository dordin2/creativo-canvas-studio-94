
import { useDesignState } from "@/context/DesignContext";
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import ElementProperties from "./properties/ElementProperties";
import NoElementSelected from "./properties/NoElementSelected";
import { SheetContent } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Properties = () => {
  const { activeElement, showInteractionPanel, setShowInteractionPanel } = useDesignState();
  const { isInteractiveMode } = useInteractiveMode();
  
  if (!isInteractiveMode) {
    return null;
  }

  // Using a div with absolute positioning instead of Sheet to avoid overlay
  return (
    <>
      {showInteractionPanel && (
        <div className="fixed right-0 top-0 h-full bg-background border-l shadow-lg w-80 z-50">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Interaction Properties</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowInteractionPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {!activeElement ? (
                <NoElementSelected />
              ) : (
                <ElementProperties 
                  element={activeElement} 
                  isInteractiveMode={isInteractiveMode} 
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Properties;

