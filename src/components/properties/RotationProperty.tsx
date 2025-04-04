
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDesignState } from "@/context/DesignContext";
import { getRotation } from "@/utils/elementStyles";

const RotationProperty = ({ element }: { element: DesignElement }) => {
  const { updateElement } = useDesignState();

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rotation = parseInt(e.target.value) || 0;
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${rotation}deg)` }
    });
  };

  return (
    <div className="space-y-2">
      <Label>Rotation</Label>
      <div className="flex gap-4 items-center">
        <Input 
          type="number" 
          value={getRotation(element)} 
          onChange={handleRotationChange}
          min={-360}
          max={360}
          className="w-24"
        />
        <span className="text-sm">degrees</span>
      </div>
    </div>
  );
};

export default RotationProperty;
