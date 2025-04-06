
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDesignState } from "@/context/DesignContext";
import { getRotation } from "@/utils/elementStyles";
import { useState, useEffect } from "react";

const RotationProperty = ({ element }: { element: DesignElement }) => {
  const { updateElement, isGameMode } = useDesignState();
  const [rotation, setRotation] = useState(getRotation(element));

  useEffect(() => {
    setRotation(getRotation(element));
  }, [element]);

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameMode) return; // No rotation in game mode
    
    const newRotation = parseInt(e.target.value) || 0;
    setRotation(newRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  };

  return (
    <div className="space-y-2">
      <Label>Rotation</Label>
      <div className="flex gap-4 items-center">
        <Input 
          type="number" 
          value={rotation}
          onChange={handleRotationChange}
          min={-360}
          max={360}
          className="w-24"
          disabled={isGameMode}
        />
        <span className="text-sm">degrees</span>
      </div>
    </div>
  );
};

export default RotationProperty;
