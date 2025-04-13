
import { useState, useRef } from "react";
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
  const [dragImagePosition, setDragImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Reference to store initial mouse position when dragging starts
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  // Element that is being dragged
  const draggedElementRef = useRef<HTMLDivElement | null>(null);
  // Custom drag ghost image
  const ghostImageRef = useRef<HTMLDivElement | null>(null);

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

  // Create ghost image for dragging
  const createGhostImage = (element: DesignElement) => {
    // Remove any existing ghost image
    if (ghostImageRef.current && ghostImageRef.current.parentNode) {
      document.body.removeChild(ghostImageRef.current);
    }

    // Create a new ghost image element
    const ghost = document.createElement('div');
    ghost.classList.add('fixed', 'pointer-events-none', 'z-50', 'opacity-80', 'shadow-md', 'rounded-md', 'bg-white', 'border', 'border-canvas-purple', 'p-2', 'flex', 'items-center', 'gap-2');
    ghost.style.width = '200px';
    ghost.style.left = '-1000px'; // Initially off-screen

    // Add image or colored box
    const thumbnail = createElementThumbnailDOM(element);
    if (thumbnail) {
      ghost.appendChild(thumbnail);
    }

    // Add element name
    const nameSpan = document.createElement('span');
    nameSpan.textContent = getElementName(element);
    nameSpan.classList.add('text-sm', 'font-medium', 'truncate');
    ghost.appendChild(nameSpan);

    // Append to body
    document.body.appendChild(ghost);
    ghostImageRef.current = ghost;

    return ghost;
  };

  // Create DOM element for thumbnail (for ghost image)
  const createElementThumbnailDOM = (element: DesignElement): HTMLElement | null => {
    const imgDiv = document.createElement('div');
    imgDiv.className = "w-8 h-8 rounded-sm flex-shrink-0 flex items-center justify-center";
    
    if (element.type === 'circle') {
      imgDiv.style.borderRadius = '50%';
    } else if (element.style?.borderRadius) {
      const borderRadius = String(element.style.borderRadius);
      imgDiv.style.borderRadius = borderRadius;
    }
    
    if (element.type === 'image' && element.dataUrl) {
      imgDiv.style.backgroundImage = `url(${element.dataUrl})`;
      imgDiv.style.backgroundSize = 'cover';
      imgDiv.style.backgroundPosition = 'center';
      return imgDiv;
    }
    
    const bgColor = element.style?.backgroundColor ? String(element.style.backgroundColor) : '#8B5CF6';
    imgDiv.style.backgroundColor = bgColor;
    
    // Add text content for text elements
    if (element.type === 'heading' || element.type === 'subheading' || element.type === 'paragraph') {
      const span = document.createElement('span');
      span.className = "text-xs text-white overflow-hidden";
      span.textContent = ((element.content as string) || 'T').charAt(0);
      imgDiv.appendChild(span);
    }
    
    return imgDiv;
  };

  // Handle mouse down to start drag
  const handleMouseDown = (e: React.MouseEvent, element: DesignElement) => {
    // Only start drag on left click
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();

    // Select the element
    setActiveElement(element);
    
    // Set up dragging state
    setDraggedItemId(element.id);
    
    // Store initial mouse position
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    
    // Create and position the ghost image
    const ghost = createGhostImage(element);
    ghost.style.transform = 'translate(-50%, -50%)';
    ghost.style.left = `${e.clientX}px`;
    ghost.style.top = `${e.clientY}px`;
    
    // Store the element being dragged
    draggedElementRef.current = e.currentTarget as HTMLDivElement;
    
    // Add event listeners for mouse move and mouse up
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    setIsDragging(true);
  };

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !ghostImageRef.current) return;
    
    // Move the ghost image with the mouse pointer
    ghostImageRef.current.style.left = `${e.clientX}px`;
    ghostImageRef.current.style.top = `${e.clientY}px`;
    
    // Find the element under the cursor to highlight drop area
    const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
    
    // Remove highlighting from all layers
    document.querySelectorAll('.layer-item').forEach(el => {
      el.classList.remove('border-canvas-purple', 'bg-purple-50', 'drop-target');
    });
    
    // Find the first layer-item element under the cursor that is not the dragged element
    const dropTarget = elementsUnderCursor.find(el => 
      el.classList.contains('layer-item') && 
      el.getAttribute('data-element-id') !== draggedItemId
    ) as HTMLElement;
    
    if (dropTarget) {
      // Add highlight to the drop target
      dropTarget.classList.add('border-canvas-purple', 'bg-purple-50', 'drop-target');
    }
  };

  // Handle mouse up to end drag
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Clean up the ghost image
    if (ghostImageRef.current && ghostImageRef.current.parentNode) {
      document.body.removeChild(ghostImageRef.current);
      ghostImageRef.current = null;
    }
    
    // Find drop target
    const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
    const dropTarget = elementsUnderCursor.find(el => 
      el.classList.contains('layer-item') && 
      el.getAttribute('data-element-id') !== draggedItemId
    ) as HTMLElement;
    
    if (dropTarget && draggedItemId) {
      const targetElementId = dropTarget.getAttribute('data-element-id');
      if (targetElementId) {
        // Find source and target elements
        const sourceElement = elements.find(el => el.id === draggedItemId);
        const targetElement = elements.find(el => el.id === targetElementId);
        
        if (sourceElement && targetElement) {
          // Determine if dragging above or below target
          const targetRect = dropTarget.getBoundingClientRect();
          const isAbove = e.clientY < targetRect.top + targetRect.height / 2;
          
          // Update the layer value based on position
          if (isAbove) {
            // Place above target (higher layer number)
            updateElementLayer(draggedItemId, targetElement.layer + 1);
          } else {
            // Place below target (lower layer number)
            updateElementLayer(draggedItemId, Math.max(1, targetElement.layer - 1));
          }
          
          // Reorder affected elements
          const elementsToUpdate = elements
            .filter(el => el.id !== draggedItemId && 
                     ((isAbove && el.layer > targetElement.layer) || 
                      (!isAbove && el.layer < targetElement.layer && el.layer > 0)))
            .sort((a, b) => isAbove ? a.layer - b.layer : b.layer - a.layer);
          
          // Update each affected element with new layer value
          let currentLayer = isAbove ? targetElement.layer + 2 : targetElement.layer - 2;
          for (const el of elementsToUpdate) {
            updateElement(el.id, { layer: Math.max(1, currentLayer) });
            currentLayer = isAbove ? currentLayer + 1 : currentLayer - 1;
          }
          
          // Apply all changes to history
          commitToHistory();
        }
      }
    }
    
    // Clean up and reset state
    document.querySelectorAll('.layer-item').forEach(el => {
      el.classList.remove('border-canvas-purple', 'bg-purple-50', 'drop-target');
    });
    
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    
    setIsDragging(false);
    setDraggedItemId(null);
    draggedElementRef.current = null;
  };

  // Render thumbnail for element in React
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
        {(element.type === 'heading' || element.type === 'subheading' || element.type === 'paragraph') && (
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
              data-element-id={element.id}
              className={`layer-item p-2 border rounded-md flex items-center justify-between ${
                activeElement?.id === element.id ? "border-canvas-purple bg-purple-50" : "border-gray-200"
              } cursor-move ${element.isHidden ? "opacity-50" : ""}`}
              onClick={() => setActiveElement(element)}
              onMouseDown={(e) => handleMouseDown(e, element)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
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
