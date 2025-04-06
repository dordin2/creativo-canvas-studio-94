
import LayersList from "../LayersList";
import { useDesignState } from "@/context/DesignContext";

const NoElementSelected = () => {
  const { canvases, activeCanvasIndex } = useDesignState();
  const currentCanvas = canvases[activeCanvasIndex];

  return (
    <div className="properties-panel border-l p-6 flex flex-col">
      <h3 className="text-lg font-medium mb-4">Properties</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Select an element to edit its properties
      </p>
      <div className="text-sm font-medium mb-4">
        Current Canvas: {currentCanvas?.name || 'Default Canvas'}
      </div>
      
      <LayersList />
    </div>
  );
};

export default NoElementSelected;
