
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { useDesignState } from "@/context/DesignContext";
import { Info } from "lucide-react";

const LayerProperties = ({
  element
}: {
  element: DesignElement;
}) => {
  const {
    canvases,
    activeCanvasIndex
  } = useDesignState();
  const currentCanvas = canvases[activeCanvasIndex];
  
  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Layer Properties</Label>
        <Info className="h-4 w-4 text-gray-400" />
      </div>
      <div className="text-sm">
        {element ? (
          <div>
            <p>Layer: {element.layer}</p>
            <p>Type: {element.type}</p>
          </div>
        ) : (
          <p>No layer selected</p>
        )}
      </div>
    </div>
  );
};

export default LayerProperties;
