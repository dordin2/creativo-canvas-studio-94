import { useState } from "react";
import { useDesignState, DesignElement } from "@/context/DesignContext";
import { Layers, Eye, EyeOff, Trash2, Copy, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LayersList = () => {
  const { 
    elements, 
    activeElement, 
    setActiveElement, 
    updateElementLayer, 
    updateElement, 
    removeElement,
    addElement,
    canvases,
    activeCanvasIndex,
    moveElementToCanvas
  } = useDesignState();
  
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [newLayerValue, setNewLayerValue] = useState<number>(0);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [newNameValue, setNewNameValue] = useState<string>('');
  const [showMoveDialog, setShowMoveDialog] = useState<boolean>(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedTargetCanvas, setSelectedTargetCanvas] = useState<string>('');

  const layerElements = [...elements]
    .filter(element => element.type !== 'background')
    .sort((a, b) => b.layer - a.layer);

  const handleLayerChange = (elementId: string, newValue: number) => {
    updateElementLayer(elementId, newValue);
    setEditingLayerId(null);
  };

  const handleNameChange = (elementId: string, newName: string) => {
    updateElement(elementId, { name: newName });
    setEditingNameId(null);
  };

  const handleDuplicate = (element: DesignElement) => {
    const duplicateProps = { ...element };
    
    if (element.type === 'image') {
      duplicateProps.dataUrl = element.dataUrl;
      duplicateProps.src = element.src;
      duplicateProps.file = element.file;
      duplicateProps.originalSize = element.originalSize;
    }
    
    duplicateProps.position = {
      x: element.position.x + 20,
      y: element.position.y + 20
    };
    
    delete (duplicateProps as any).id;
    
    addElement(element.type, duplicateProps);
  };

  const toggleVisibility = (element: DesignElement) => {
    updateElement(element.id, {
      isHidden: !element.isHidden
    });
  };

  const getElementTypeName = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getElementName = (element: DesignElement): string => {
    return element.name || getElementTypeName(element.type);
  };

  const handleMoveToCanvas = () => {
    if (selectedElementId && selectedTargetCanvas) {
      const targetCanvasIndex = canvases.findIndex(canvas => canvas.id === selectedTargetCanvas);
      if (targetCanvasIndex !== -1) {
        moveElementToCanvas(selectedElementId, targetCanvasIndex);
        setShowMoveDialog(false);
        setSelectedElementId(null);
        setSelectedTargetCanvas('');
      }
    }
  };

  const openMoveDialog = (elementId: string) => {
    setSelectedElementId(elementId);
    setSelectedTargetCanvas('');
    setShowMoveDialog(true);
  };

  return (
    <div className="border rounded-md p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-5 w-5 text-canvas-purple" />
        <h3 className="font-medium">Layers ({canvases[activeCanvasIndex]?.name || 'Current Canvas'})</h3>
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
              } cursor-pointer ${element.isHidden ? "opacity-50" : ""}`}
              onClick={() => setActiveElement(element)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div 
                  className="w-4 h-4 rounded-sm flex-shrink-0" 
                  style={{ 
                    backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
                    borderRadius: element.type === 'circle' ? '50%' : element.style?.borderRadius as string || '0' 
                  }}
                ></div>
                
                {editingNameId === element.id ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleNameChange(element.id, newNameValue);
                    }}
                    className="flex-1 min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Input
                      type="text"
                      value={newNameValue}
                      onChange={(e) => setNewNameValue(e.target.value)}
                      className="h-7 text-xs w-full"
                      autoFocus
                      onBlur={() => handleNameChange(element.id, newNameValue)}
                    />
                  </form>
                ) : (
                  <div 
                    className="text-sm font-medium truncate flex-1"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingNameId(element.id);
                      setNewNameValue(getElementName(element));
                    }}
                    title={getElementName(element)}
                  >
                    {getElementName(element)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {editingLayerId === element.id ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLayerChange(element.id, newLayerValue);
                    }}
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Input
                      type="number"
                      value={newLayerValue}
                      onChange={(e) => setNewLayerValue(parseInt(e.target.value))}
                      className="w-16 h-7 text-xs"
                      min="1"
                      autoFocus
                      onBlur={() => handleLayerChange(element.id, newLayerValue)}
                    />
                  </form>
                ) : (
                  <>
                    <div 
                      className="text-xs bg-gray-100 px-2 py-1 rounded cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingLayerId(element.id);
                        setNewLayerValue(element.layer);
                      }}
                    >
                      {element.layer}
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisibility(element);
                            }}
                          >
                            {element.isHidden ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{element.isHidden ? 'Show' : 'Hide'}</p>
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
                              handleDuplicate(element);
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Duplicate</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {canvases.length > 1 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                openMoveDialog(element.id);
                              }}
                            >
                              <MoveRight className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Move to canvas</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
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

      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move element to canvas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select destination canvas:</label>
              <Select value={selectedTargetCanvas} onValueChange={setSelectedTargetCanvas}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a canvas" />
                </SelectTrigger>
                <SelectContent>
                  {canvases.map((canvas, index) => 
                    index !== activeCanvasIndex && (
                      <SelectItem key={canvas.id} value={canvas.id}>
                        {canvas.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
                Cancel
              </Button>
              <Button 
                disabled={!selectedTargetCanvas} 
                onClick={handleMoveToCanvas}
              >
                Move
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LayersList;
