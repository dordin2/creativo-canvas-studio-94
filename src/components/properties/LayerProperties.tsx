
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Layer</Label>
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1" />
          <span>Higher layers appear on top</span>
        </div>
      </div>
      
      <div className="text-sm">
        Current layer: {element.layer}
      </div>
    </div>
  );
};

export default LayerProperties;
