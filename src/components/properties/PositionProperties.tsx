import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDesignState } from "@/context/DesignContext";

const PositionProperties = ({
  element
}: {
  element: DesignElement;
}) => {
  const { updateElement, isGameMode } = useDesignState();
  
  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newX = Math.round(Number(e.target.value));
    updateElement(element.id, {
      position: {
        ...element.position,
        x: newX
      }
    });
    
    // Log position info to help with debugging fullscreen positioning
    console.log(`Element position updated - ID: ${element.id}, X: ${newX}, Y: ${element.position.y}`);
  };
  
  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newY = Math.round(Number(e.target.value));
    updateElement(element.id, {
      position: {
        ...element.position,
        y: newY
      }
    });
    
    // Log position info to help with debugging fullscreen positioning
    console.log(`Element position updated - ID: ${element.id}, X: ${element.position.x}, Y: ${newY}`);
  };
  
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!element.size) return;
    
    updateElement(element.id, {
      size: {
        ...element.size,
        width: Math.round(Number(e.target.value))
      }
    });
  };
  
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!element.size) return;
    
    updateElement(element.id, {
      size: {
        ...element.size,
        height: Math.round(Number(e.target.value))
      }
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="position-x">X Position</Label>
          <Input
            id="position-x"
            type="number"
            value={Math.round(element.position.x)}
            onChange={handleXChange}
          />
        </div>
        <div>
          <Label htmlFor="position-y">Y Position</Label>
          <Input
            id="position-y"
            type="number"
            value={Math.round(element.position.y)}
            onChange={handleYChange}
          />
        </div>
      </div>
      
      {element.size && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="size-width">Width</Label>
            <Input
              id="size-width"
              type="number"
              value={Math.round(element.size.width)}
              onChange={handleWidthChange}
            />
          </div>
          <div>
            <Label htmlFor="size-height">Height</Label>
            <Input
              id="size-height"
              type="number"
              value={Math.round(element.size.height)}
              onChange={handleHeightChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionProperties;
