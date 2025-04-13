import { useState, useRef } from "react";
import { useDesignState, DesignElement } from "@/context/DesignContext";
import { Layers, Eye, EyeOff, Trash2, Copy, MoveRight, GripVertical } from "lucide-react";
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
} from "@/components/ui/dialog";
import { prepareElementForDuplication } from "@/utils/elementUtils";

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
    moveElementToCanvas,
    commitToHistory
  } = useDesignState();
  
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [newNameValue, setNewNameValue] = useState<string>('');
  const [showMoveDialog, setShowMoveDialog] = useState<boolean>(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedTargetCanvas, setSelectedTargetCanvas] = useState<string>('');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // Sort elements by layer in descending order (highest layer first)
  const layerElements = [...elements]
    .filter(element => element.type !== 'background')
    .sort((a, b) => b.layer - a.layer);

  const handleNameChange = (elementId: string, newName: string) => {
    updateElement(elementId, { name: newName });
    setEditingNameId(null);
  };

  const handleDuplicate = (element: DesignElement) => {
    console.log("LayersList - Original element to duplicate:", element);
    
    // Use the utility function to prepare the element for duplication
    const duplicateProps = prepareElementForDuplication(element);
    
    console.log("LayersList - Duplicate props before adding:", duplicateProps);
    
    // Add the duplicated element
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

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setDraggedItemId(elementId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a ghost image for dragging
    const dragGhost = document.createElement('div');
    dragGhost.classList.add('bg-white', 'border', 'border-canvas-purple', 'rounded-md', 'opacity-80', 'p-2');
    dragGhost.style.width = '200px';
    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-1000px';
    dragGhost.style.zIndex = '9999';
    dragGhost.textContent = getElementName(elements.find(el => el.id === elementId) as DesignElement);
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 0, 0);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop - reorder layers
  const handleDrop = (e: React.DragEvent, targetElementId: string) => {
    e.preventDefault();
    
    if (!draggedItemId || draggedItemId === targetElementId) {
      setDraggedItemId(null);
      return;
    }
    
    const sourceElement = elements.find(el => el.id === draggedItemId);
    const targetElement = elements.find(el => el.id === targetElementId);
    
    if (!sourceElement || !targetElement) {
      setDraggedItemId(null);
      return;
    }
    
    // Update the layer value of the dragged element
    updateElementLayer(draggedItemId, targetElement.layer + 1);
    
    // Update layers of affected elements
    const elementsToUpdate = elements
      .filter(el => el.id !== draggedItemId && el.layer > targetElement.layer)
      .sort((a, b) => a.layer - b.layer);
    
    // Update each affected element with new layer value
    let currentLayer = targetElement.layer + 2;
    for (const el of elementsToUpdate) {
      updateElement(el.id, { layer: currentLayer });
      currentLayer++;
    }
    
    // Apply all changes to history
    commitToHistory();
    setDraggedItemId(null);
  };

  // Handle drag end - cleanup
  const handleDragEnd = () => {
    setDraggedItemId(null);
    // Remove any ghost elements
    const ghosts = document.querySelectorAll('div[style*="position: absolute; top: -1000px"]');
    ghosts.forEach(ghost => ghost.remove());
  };

  // Generate thumbnail for element
  const renderElementThumbnail = (element: DesignElement) => {
    if (element.type === 'image' && element.dataUrl) {
      return (
        <div 
          className="w-8 h-8 rounded-sm flex-shrink-0 bg-center bg-cover" 
          style={{ backgroundImage: `url(${element.dataUrl})` }}
        ></div>
      );
    }
    
    return (
      <div 
        className="w-8 h-8 rounded-sm flex-shrink-0 flex items-center justify-center" 
        style={{ 
          backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
          borderRadius: element.type === 'circle' ? '50%' : element.style?.borderRadius as string || '0' 
        }}
      >
        {element.type === 'heading' || element.type === 'subheading' || element.type === 'paragraph' && (
          <span className="text-xs text-white overflow-hidden">
            {(element.content as string || 'T').charAt(0)}
          </span>
        )}
      </div>
    );
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
              } cursor-pointer ${element.isHidden ? "opacity-50" : ""} ${
                draggedItemId === element.id ? "border-dashed border-blue-400" : ""
              }`}
              onClick={() => setActiveElement(element)}
              draggable
              onDragStart={(e) => handleDragStart(e, element.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, element.id)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0 cursor-move">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                
                {renderElementThumbnail(element)}
                
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
