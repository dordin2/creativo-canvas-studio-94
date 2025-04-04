import { DesignElement } from "@/types/designTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDesignState } from "@/context/DesignContext";
const PositionProperties = ({
  element
}: {
  element: DesignElement;
}) => {
  const {
    updateElement
  } = useDesignState();
  return <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        
        
      </div>
      
      {element.size && <div className="grid grid-cols-2 gap-4 mt-4">
          
          
        </div>}
    </div>;
};
export default PositionProperties;