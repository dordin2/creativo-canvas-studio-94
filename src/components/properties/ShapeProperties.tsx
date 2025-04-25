
import { DesignElement } from "@/types/designTypes";
import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDesignState } from "@/context/DesignContext";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { getRotation } from "@/utils/elementStyles";

const ShapeProperties = ({ element }: { element: DesignElement }) => {
  const { updateElementWithoutHistory, commitToHistory, isGameMode } = useDesignState();
  const [rotation, setRotation] = useState(getRotation(element));

  useEffect(() => {
    setRotation(getRotation(element));
  }, [element]);

  const handleColorChange = (newColor: string) => {
    updateElementWithoutHistory(element.id, {
      style: { ...element.style, backgroundColor: newColor }
    });
    commitToHistory();
  };

  const handleRotationChange = (value: number[]) => {
    if (isGameMode) return;
    
    const newRotation = Math.round(value[0]);
    setRotation(newRotation);
    updateElementWithoutHistory(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGameMode) return;
    
    const inputValue = e.target.value;
    const newRotation = parseInt(inputValue) || 0;
    
    const boundedRotation = Math.max(-360, Math.min(360, newRotation));
    
    handleRotationChange([boundedRotation]);
    commitToHistory();
  };

  const handleRotationCommit = () => {
    commitToHistory();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Fill Color</Label>
        <HexColorPicker 
          color={element.style?.backgroundColor as string || '#8B5CF6'} 
          onChange={handleColorChange}
          className="w-full mb-2 mt-2"
        />
        <Input 
          value={element.style?.backgroundColor as string || '#8B5CF6'} 
          onChange={(e) => handleColorChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-4">
        <Label>Rotation</Label>
        <div className="space-y-2">
          <Slider
            value={[rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={handleRotationChange}
            onValueCommit={handleRotationCommit}
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
    </div>
  );
};

export default ShapeProperties;
