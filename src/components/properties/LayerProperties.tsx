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
  return;
};
export default LayerProperties;