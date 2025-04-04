
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDesignState } from "@/context/DesignContext";

const LayerProperties = ({ element }: { element: DesignElement }) => {
  const { updateElement } = useDesignState();

  return (
    <div className="space-y-2">
      <Label>Layer Number</Label>
      <div className="flex items-center gap-2 mt-2">
        <Input 
          type="number" 
          value={element.layer} 
          onChange={(e) => updateElement(element.id, { 
            layer: Number(e.target.value) 
          })}
          min="1"
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">
          Higher = on top
        </span>
      </div>
    </div>
  );
};

export default LayerProperties;
