
import { useState } from "react";
import { useDesignState, DesignElement } from "@/context/DesignContext";
import { Layers, ChevronUp, ChevronDown, Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LayersList = () => {
  const { elements, activeElement, setActiveElement, updateElementLayer, removeElement } = useDesignState();
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [newLayerValue, setNewLayerValue] = useState<number>(0);

  // Filter out background element and sort by layer (highest first)
  const layerElements = [...elements]
    .filter(element => element.type !== 'background')
    .sort((a, b) => b.layer - a.layer);

  const handleLayerChange = (elementId: string, newValue: number) => {
    updateElementLayer(elementId, newValue);
    setEditingLayerId(null);
  };

  const moveLayerUp = (element: DesignElement) => {
    // Find next highest layer value
    const higherElements = elements.filter(elem => elem.layer > element.layer);
    if (higherElements.length === 0) return; // Already at the top
    
    const nextLayer = Math.min(...higherElements.map(elem => elem.layer));
    updateElementLayer(element.id, nextLayer + 1);
  };

  const moveLayerDown = (element: DesignElement) => {
    // Find next lowest layer value
    const lowerElements = elements.filter(elem => elem.layer < element.layer && elem.type !== 'background');
    if (lowerElements.length === 0) return; // Already at the bottom (except background)
    
    const prevLayer = Math.max(...lowerElements.map(elem => elem.layer));
    updateElementLayer(element.id, prevLayer - 1);
  };

  const getElementTypeName = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="border rounded-md p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-5 w-5 text-canvas-purple" />
        <h3 className="font-medium">Layers</h3>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {layerElements.length === 0 ? (
          <div className="text-sm text-gray-500 italic">No elements added yet</div>
        ) : (
          layerElements.map((element) => (
            <div 
              key={element.id}
              className={`p-2 border rounded-md flex items-center justify-between ${
                activeElement?.id === element.id ? "border-canvas-purple bg-purple-50" : "border-gray-200"
              } cursor-pointer`}
              onClick={() => setActiveElement(element)}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ 
                    backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
                    borderRadius: element.type === 'circle' ? '50%' : element.style?.borderRadius as string || '0' 
                  }}
                ></div>
                <div className="text-sm font-medium">{getElementTypeName(element.type)}</div>
              </div>

              <div className="flex items-center gap-1">
                {editingLayerId === element.id ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLayerChange(element.id, newLayerValue);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Input
                      type="number"
                      value={newLayerValue}
                      onChange={(e) => setNewLayerValue(parseInt(e.target.value))}
                      className="w-16 h-7 text-xs"
                      min="1"
                      autoFocus
                    />
                    <Button type="submit" size="sm" variant="ghost" className="h-7 w-7 p-0">
                      ✓
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {element.layer}
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setEditingLayerId(element.id);
                              setNewLayerValue(element.layer);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit layer number</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayerUp(element);
                            }}
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Move higher</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayerDown(element);
                            }}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Move lower</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeElement(element.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete element</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LayersList;
