
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { useDesignState } from "@/context/DesignContext";
import { Info } from "lucide-react";

const LayerProperties = ({ element }: { element: DesignElement }) => {
  const { canvases, activeCanvasIndex } = useDesignState();
  const currentCanvas = canvases[activeCanvasIndex];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Layer Position</Label>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="bg-muted p-3 rounded-md text-sm">
        <p>Layers are ordered by drag and drop:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
          <li>Drag elements up to bring them forward</li>
          <li>Drag elements down to send them backward</li>
          <li>Top items in the list appear on top of the canvas</li>
        </ul>
      </div>

      <div className="mt-4 bg-muted p-3 rounded-md text-sm">
        <p>Layer thumbnails show element previews:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
          <li>When dragging, a thumbnail preview follows your cursor</li>
          <li>Double-click layer names to rename them</li>
          <li>Use the visibility toggle to show/hide elements</li>
        </ul>
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        Canvas: {currentCanvas?.name || 'Current Canvas'}
      </div>
    </div>
  );
};

export default LayerProperties;
