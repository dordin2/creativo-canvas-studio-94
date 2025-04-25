
import { useDesignState } from "@/context/DesignContext";
import { useInteractiveMode } from "@/context/InteractiveModeContext";
import ElementProperties from "./properties/ElementProperties";
import NoElementSelected from "./properties/NoElementSelected";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Properties = () => {
  const { activeElement, showInteractionPanel, setShowInteractionPanel } = useDesignState();
  const { isInteractiveMode } = useInteractiveMode();
  
  if (!isInteractiveMode) {
    return null;
  }

  return (
    <Sheet open={showInteractionPanel} onOpenChange={setShowInteractionPanel}>
      <SheetContent className="w-80 p-0">
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
      </SheetContent>
    </Sheet>
  );
};

export default Properties;
