
import { Layers } from "lucide-react";

const LayersHeader = () => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Layers className="h-5 w-5 text-canvas-purple" />
      <h3 className="font-medium">Layers</h3>
    </div>
  );
};

export default LayersHeader;
