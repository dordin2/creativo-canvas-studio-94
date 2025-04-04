
import { Layers } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const LayersHeader = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex items-center gap-2 ${isMobile ? 'px-4 pt-4' : 'mb-4'}`}>
      <Layers className="h-5 w-5 text-canvas-purple" />
      <h3 className="font-medium">Layers</h3>
    </div>
  );
};

export default LayersHeader;
