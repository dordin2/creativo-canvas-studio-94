import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDesignState } from "@/context/DesignContext";
import { getRotation } from "@/utils/elementStyles";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

const RotationProperty = ({ element }: { element: DesignElement }) => {
  const { updateElement, isGameMode } = useDesignState();
  const [rotation, setRotation] = useState(getRotation(element));

  useEffect(() => {
    setRotation(getRotation(element));
  }, [element]);

  const handleRotationChange = (value: number) => {
    if (isGameMode) return; // No rotation in game mode
    
    const newRotation = Math.round(value);
    setRotation(newRotation);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameMode) return;
    
    // Parse input and handle non-numeric input
    const inputValue = e.target.value;
    const newRotation = parseInt(inputValue) || 0;
    
    // Keep rotation between -360 and 360 degrees
    const boundedRotation = Math.max(-360, Math.min(360, newRotation));
    
    handleRotationChange(boundedRotation);
  };

  return (
    <div className="space-y-4">
      <Label>Rotation</Label>
      <div className="space-y-2">
        <Slider
          value={[rotation]}
          min={-180}
          max={180}
          step={1}
          onValueChange={(values) => handleRotationChange(values[0])}
          disabled={isGameMode}
          className="my-4"
        />
        <div className="flex gap-4 items-center">
          <Input 
            type="number" 
            value={rotation}
            onChange={handleInputChange}
            min={-360}
            max={360}
            className="w-24"
            disabled={isGameMode}
          />
          <span className="text-sm">degrees</span>
        </div>
      </div>
    </div>
  );
};

export default RotationProperty;
