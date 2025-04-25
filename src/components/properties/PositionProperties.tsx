
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
        x: Math.round(Number(e.target.value))
      }
    });
  };
  
  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, {
      position: {
        ...element.position,
        y: Math.round(Number(e.target.value))
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
    </div>
  );
};

export default PositionProperties;
