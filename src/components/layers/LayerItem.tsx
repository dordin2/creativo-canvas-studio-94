
import { useState } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { ChevronUp, ChevronDown, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LayerItemProps {
  element: DesignElement;
  isActive: boolean;
  onSelect: () => void;
}

const LayerItem = ({ element, isActive, onSelect }: LayerItemProps) => {
  const { updateElementLayer, removeElement } = useDesignState();
  const [editingLayer, setEditingLayer] = useState<boolean>(false);
  const [newLayerValue, setNewLayerValue] = useState<number>(element.layer);

  const handleLayerChange = (newValue: number) => {
    updateElementLayer(element.id, newValue);
    setEditingLayer(false);
  };

  const moveLayerUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { elements } = useDesignState();
    // Find next highest layer value
    const higherElements = elements.filter(elem => elem.layer > element.layer);
    if (higherElements.length === 0) return; // Already at the top
    
    const nextLayer = Math.min(...higherElements.map(elem => elem.layer));
    updateElementLayer(element.id, nextLayer + 1);
  };

  const moveLayerDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { elements } = useDesignState();
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
    <div 
      className={`p-2 border rounded-md flex items-center justify-between ${
        isActive ? "border-canvas-purple bg-purple-50" : "border-gray-200"
      } cursor-pointer`}
      onClick={onSelect}
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
        {editingLayer ? (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleLayerChange(newLayerValue);
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
            
            <LayerItemControls 
              element={element} 
              onEdit={() => {
                setEditingLayer(true);
                setNewLayerValue(element.layer);
              }}
              onMoveUp={moveLayerUp}
              onMoveDown={moveLayerDown}
            />
          </>
        )}
      </div>
    </div>
  );
};

interface LayerItemControlsProps {
  element: DesignElement;
  onEdit: () => void;
  onMoveUp: (e: React.MouseEvent) => void;
  onMoveDown: (e: React.MouseEvent) => void;
}

const LayerItemControls = ({ element, onEdit, onMoveUp, onMoveDown }: LayerItemControlsProps) => {
  const { removeElement } = useDesignState();

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
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
              onClick={onMoveUp}
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
              onClick={onMoveDown}
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
  );
};

export default LayerItem;
