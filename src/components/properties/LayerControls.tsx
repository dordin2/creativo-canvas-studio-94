
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, Layers } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface LayerControlsProps {
  element: DesignElement;
}

const LayerControls = ({ element }: LayerControlsProps) => {
  const { updateElementLayer, getHighestLayer } = useDesignState();
  const { t } = useLanguage();
  
  const bringToFront = () => {
    const highestLayer = getHighestLayer();
    updateElementLayer(element.id, highestLayer + 1);
  };
  
  const sendToBack = () => {
    updateElementLayer(element.id, 1);
  };
  
  const moveUp = () => {
    updateElementLayer(element.id, element.layer + 1);
  };
  
  const moveDown = () => {
    if (element.layer > 1) {
      updateElementLayer(element.id, element.layer - 1);
    }
  };
  
  const handleLayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLayer = parseInt(e.target.value);
    if (!isNaN(newLayer) && newLayer > 0) {
      updateElementLayer(element.id, newLayer);
    }
  };

  return (
    <div className="space-y-3 border rounded-md p-3">
      <div className="flex items-center justify-between">
        <Label className="font-medium flex items-center">
          <Layers className="h-4 w-4 mr-2" />
          {t('properties.layer.title') || "Layer Controls"}
        </Label>
        <div className="space-x-1 flex">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7" 
            onClick={moveDown} 
            disabled={element.layer <= 1}
            title={t('properties.layer.moveDown') || "Move Down"}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7" 
            onClick={moveUp}
            title={t('properties.layer.moveUp') || "Move Up"}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={element.layer}
          onChange={handleLayerChange}
          min="1"
          className="w-full"
        />
        
        <div className="grid grid-cols-2 gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={sendToBack}
            className="text-xs"
          >
            {t('properties.layer.sendToBack') || "Back"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={bringToFront}
            className="text-xs"
          >
            {t('properties.layer.bringToFront') || "Front"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LayerControls;
