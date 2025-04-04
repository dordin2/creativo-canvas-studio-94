
import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDesignState } from "@/context/DesignContext";

const PositionProperties = ({ element }: { element: DesignElement }) => {
  const { updateElement } = useDesignState();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Position X</Label>
          <Input 
            type="number" 
            value={element.position.x} 
            onChange={(e) => updateElement(element.id, { 
              position: { ...element.position, x: Number(e.target.value) } 
            })}
            className="mt-2"
          />
        </div>
        <div>
          <Label>Position Y</Label>
          <Input 
            type="number" 
            value={element.position.y} 
            onChange={(e) => updateElement(element.id, { 
              position: { ...element.position, y: Number(e.target.value) } 
            })}
            className="mt-2"
          />
        </div>
      </div>
      
      {element.size && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Width</Label>
            <Input 
              type="number" 
              value={element.size.width} 
              onChange={(e) => updateElement(element.id, { 
                size: { ...element.size, width: Number(e.target.value) } 
              })}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Height</Label>
            <Input 
              type="number" 
              value={element.size.height} 
              onChange={(e) => updateElement(element.id, { 
                size: { ...element.size, height: Number(e.target.value) } 
              })}
              className="mt-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionProperties;
