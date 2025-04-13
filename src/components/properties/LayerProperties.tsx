
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { useDesignState } from "@/context/DesignContext";
import { ArrowUpDown } from "lucide-react";

const LayerProperties = ({ element }: { element: DesignElement }) => {
  const { canvases, activeCanvasIndex } = useDesignState();
  const currentCanvas = canvases[activeCanvasIndex];

  return (
    <div className="space-y-2">
      <Label>Layer</Label>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md">
          <span className="text-lg font-semibold">{element.layer}</span>
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
        </div>
        <span className="text-sm text-muted-foreground">
          Higher = on top
        </span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        <span>Drag in layer list to reorder</span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Canvas: {currentCanvas?.name || 'Current Canvas'}
      </div>
    </div>
  );
};

export default LayerProperties;
