
import { DesignElement } from "@/types/designTypes";
import { HexColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDesignState } from "@/context/DesignContext";
import RotationProperty from "./RotationProperty";

const ShapeProperties = ({ element }: { element: DesignElement }) => {
  const { updateElement } = useDesignState();

  const handleColorChange = (newColor: string) => {
    updateElement(element.id, {
      style: { ...element.style, backgroundColor: newColor }
    });
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
      
      <RotationProperty element={element} />
    </div>
  );
};

export default ShapeProperties;
