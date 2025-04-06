
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDesignState } from "@/context/DesignContext";

const PositionProperties = ({
  element
}: {
  element: DesignElement;
}) => {
  const { updateElement } = useDesignState();
  
  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, {
      position: {
        ...element.position,
        x: Number(e.target.value)
      }
    });
  };
  
  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, {
      position: {
        ...element.position,
        y: Number(e.target.value)
      }
    });
  };
  
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!element.size) return;
    
    updateElement(element.id, {
      size: {
        ...element.size,
        width: Number(e.target.value)
      }
    });
  };
  
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!element.size) return;
    
    updateElement(element.id, {
      size: {
        ...element.size,
        height: Number(e.target.value)
      }
    });
  };
  
  // Round values only for display in the inputs
  const displayX = Math.round(element.position.x);
  const displayY = Math.round(element.position.y);
  const displayWidth = element.size ? Math.round(element.size.width) : 0;
  const displayHeight = element.size ? Math.round(element.size.height) : 0;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="position-x">X Position</Label>
          <Input
            id="position-x"
            type="number"
            value={displayX}
            onChange={handleXChange}
          />
        </div>
        <div>
          <Label htmlFor="position-y">Y Position</Label>
          <Input
            id="position-y"
            type="number"
            value={displayY}
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
              value={displayWidth}
              onChange={handleWidthChange}
            />
          </div>
          <div>
            <Label htmlFor="size-height">Height</Label>
            <Input
              id="size-height"
              type="number"
              value={displayHeight}
              onChange={handleHeightChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionProperties;
