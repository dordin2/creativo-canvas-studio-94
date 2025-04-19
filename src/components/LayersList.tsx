import { useState, useRef } from "react";
import { useDesignState } from "@/context/DesignContext";
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
import { DesignElement } from "@/types/designTypes"; // Added this import to fix the TypeScript errors
import { prepareElementForDuplication } from "@/utils/elementUtils";
import { updateElementsOrder } from "@/utils/layerUtils";

const LayersList = () => {
  const { 
    elements, 
    activeElement, 
    setActiveElement, 
    updateElement, 
    removeElement,
    addElement,
    canvases,
    activeCanvasIndex,
    moveElementToCanvas,
    setCanvases
  } = useDesignState();
  
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [newNameValue, setNewNameValue] = useState<string>('');
  const [showMoveDialog, setShowMoveDialog] = useState<boolean>(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedTargetCanvas, setSelectedTargetCanvas] = useState<string>('');
  const [draggedElement, setDraggedElement] = useState<DesignElement | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Create an invisible element for the drag preview instead of using DOM manipulation
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);

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

  // Generate element thumbnail
  const renderElementThumbnail = (element: DesignElement) => {
    // Define common style for the thumbnail container
    const commonStyle = "w-8 h-8 flex-shrink-0 flex items-center justify-center border rounded";
    
    switch (element.type) {
      case 'rectangle':
        return (
          <div 
            className={commonStyle}
            style={{ 
              backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
              borderRadius: element.style?.borderRadius as string || '0',
              borderColor: element.style?.borderColor as string || 'transparent',
              borderWidth: element.style?.borderWidth ? `${element.style.borderWidth}px` : '0',
            }}
          />
        );
      case 'circle':
        return (
          <div 
            className={commonStyle}
            style={{ 
              backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
              borderRadius: '50%',
              borderColor: element.style?.borderColor as string || 'transparent',
              borderWidth: element.style?.borderWidth ? `${element.style.borderWidth}px` : '0',
            }}
          />
        );
      case 'triangle':
        return (
          <div className={`${commonStyle} bg-transparent relative`}>
            <div 
              style={{ 
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: `20px solid ${element.style?.backgroundColor as string || '#8B5CF6'}`,
              }}
            />
          </div>
        );
      case 'line':
        return (
          <div className={`${commonStyle} bg-transparent`}>
            <div 
              style={{ 
                width: '80%',
                height: `${element.style?.strokeWidth || 2}px`,
                backgroundColor: element.style?.stroke as string || '#8B5CF6',
              }}
            />
          </div>
        );
      case 'heading':
      case 'subheading':
      case 'paragraph':
        return (
          <div 
            className={`${commonStyle} flex items-center justify-center bg-gray-100 text-xs font-medium overflow-hidden`}
            style={{
              color: element.style?.color as string || '#000000',
            }}
          >
            {element.type === 'heading' ? 'H' : element.type === 'subheading' ? 'S' : 'P'}
          </div>
        );
      case 'image':
        return (
          <div 
            className={`${commonStyle} bg-gray-200 overflow-hidden`}
          >
            {element.dataUrl ? (
              <img src={element.dataUrl} alt="Thumbnail" className="object-cover w-full h-full" />
            ) : (
              <div className="text-xs text-gray-500">IMG</div>
            )}
          </div>
        );
      case 'puzzle':
        return (
          <div className={`${commonStyle} bg-yellow-100 text-yellow-700 font-bold text-xs`}>
            PZL
          </div>
        );
      case 'sequencePuzzle':
        return (
          <div className={`${commonStyle} bg-green-100 text-green-700 font-bold text-xs`}>
            SEQ
          </div>
        );
      case 'clickSequencePuzzle':
        return (
          <div className={`${commonStyle} bg-blue-100 text-blue-700 font-bold text-xs`}>
            CLK
          </div>
        );
      case 'sliderPuzzle':
        return (
          <div className={`${commonStyle} bg-purple-100 text-purple-700 font-bold text-xs`}>
            SLD
          </div>
        );
      default:
        return (
          <div className={`${commonStyle} bg-gray-100`}>
            <div 
              style={{ 
                width: '70%',
                height: '70%',
                backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
                borderRadius: element.style?.borderRadius as string || '0',
              }}
            />
          </div>
        );
    }
  };

  // Improved drag and drop handlers
  const handleDragStart = (e: React.DragEvent, element: DesignElement, index: number) => {
    // Prevent the default drag ghost image
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent 1x1 pixel
    e.dataTransfer.setDragImage(img, 0, 0);
    
    // Set data for the drag operation
    e.dataTransfer.setData('text/plain', element.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Update state to reflect dragging
    setDraggedElement(element);
    
    // Set the custom preview in a fixed position that won't interfere with the UI
    if (dragPreviewRef.current) {
      const preview = dragPreviewRef.current;
      
      // Position the preview near the cursor but out of the way
      preview.style.display = 'flex';
      preview.style.top = `${e.clientY + 15}px`;
      preview.style.left = `${e.clientX + 15}px`;
      
      // Set the preview content
      preview.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 flex-shrink-0 rounded-sm overflow-hidden" style="
            ${element.type === 'circle' ? 'border-radius: 50%;' : ''}
            ${element.type === 'image' && element.dataUrl ? `background-image: url(${element.dataUrl}); background-size: cover;` : ''}
            ${element.type !== 'image' ? `background-color: ${element.style?.backgroundColor || '#8B5CF6'};` : ''}
          "></div>
          <span class="text-sm font-medium whitespace-nowrap">${getElementName(element)}</span>
        </div>
      `;
      
      // Add the element to the document
      document.body.appendChild(preview);
    }
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedElement) {
      setDragOverIndex(index);
      
      // Update the position of the drag preview to follow the cursor
      if (dragPreviewRef.current) {
        dragPreviewRef.current.style.top = `${e.clientY + 15}px`;
        dragPreviewRef.current.style.left = `${e.clientX + 15}px`;
      }
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    // Hide the drag preview
    if (dragPreviewRef.current) {
      dragPreviewRef.current.style.display = 'none';
    }
    
    if (!draggedElement) return;
    
    const sourceIndex = layerElements.findIndex(el => el.id === draggedElement.id);
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      setDraggedElement(null);
      setDragOverIndex(null);
      return;
    }

    // Get the current canvas elements
    const currentCanvas = canvases[activeCanvasIndex];
    if (!currentCanvas) return;

    // Create a copy of the elements to work with
    const updatedElements = [...currentCanvas.elements];
    
    // Update the layers based on new order
    const newElements = updateElementsOrder(updatedElements, sourceIndex, targetIndex, layerElements);
    
    // Update the canvas with the new elements
    const updatedCanvases = [...canvases];
    updatedCanvases[activeCanvasIndex] = {
      ...currentCanvas,
      elements: newElements
    };
    
    setCanvases(updatedCanvases);
    
    // Reset drag state
    setDraggedElement(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    // Hide the drag preview when drag ends
    if (dragPreviewRef.current) {
      dragPreviewRef.current.style.display = 'none';
    }
    
    setDraggedElement(null);
    setDragOverIndex(null);
  };

  // Add touch handling state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchedElementId, setTouchedElementId] = useState<string | null>(null);

  const handleTouchStart = (e: React.TouchEvent, element: DesignElement, index: number) => {
    setTouchStart(e.touches[0].clientY);
    setTouchedElementId(element.id);
    setDraggedElement(element);
    setDraggingIndex(index);

    // Add visual feedback for touch
    const target = e.currentTarget as HTMLDivElement;
    target.style.transform = 'scale(1.02)';
    target.style.transition = 'transform 0.2s ease';
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (!touchStart) return;

    const currentTouch = e.touches[0].clientY;
    const target = e.currentTarget as HTMLDivElement;
    const elementRect = target.getBoundingClientRect();
    const containerRect = target.closest('.space-y-2')?.getBoundingClientRect();

    if (!containerRect) return;

    // Calculate if we're hovering over another element
    const elementsUnder = document.elementsFromPoint(
      elementRect.left + elementRect.width / 2,
      currentTouch
    );

    const targetElement = elementsUnder.find(el => 
      el.classList.contains('layer-item') && 
      el !== target
    );

    if (targetElement) {
      const targetIndex = parseInt(targetElement.getAttribute('data-index') || '-1');
      if (targetIndex !== -1) {
        setDragOverIndex(targetIndex);
      }
    }

    // Update visual position
    const deltaY = currentTouch - touchStart;
    target.style.transform = `translateY(${deltaY}px) scale(1.02)`;
  };

  const handleTouchEnd = (e: React.TouchEvent, targetIndex: number) => {
    if (!touchStart || !touchedElementId) return;

    const target = e.currentTarget as HTMLDivElement;
    target.style.transform = '';
    target.style.transition = '';

    const sourceIndex = layerElements.findIndex(el => el.id === touchedElementId);
    
    if (sourceIndex !== -1 && dragOverIndex !== null && sourceIndex !== dragOverIndex) {
      // Perform the reorder
      const newElements = updateElementsOrder(elements, sourceIndex, dragOverIndex, elements);
      const updatedCanvases = [...canvases];
      if (activeCanvasIndex >= 0 && activeCanvasIndex < updatedCanvases.length) {
        updatedCanvases[activeCanvasIndex].elements = newElements;
        setCanvases(updatedCanvases);
      }
    }

    // Reset states
    setTouchStart(null);
    setTouchedElementId(null);
    setDraggedElement(null);
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="border rounded-md p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-5 w-5 text-canvas-purple" />
        <h3 className="font-medium">Layers ({canvases[activeCanvasIndex]?.name || 'Current Canvas'})</h3>
      </div>

      {/* Custom drag preview element positioned absolutely and hidden by default */}
      <div 
        ref={dragPreviewRef} 
        className="fixed bg-white px-3 py-2 rounded-md shadow-lg border z-[9999] pointer-events-none items-center"
        style={{ display: 'none' }}
        aria-hidden="true"
      ></div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {layerElements.length === 0 ? (
          <div className="text-sm text-gray-500 italic">No elements added yet</div>
        ) : (
          layerElements.map((element, index) => (
            <div 
              key={element.id}
              className={`layer-item p-2 border rounded-md flex items-center justify-between ${
                activeElement?.id === element.id ? "border-canvas-purple bg-purple-50" : "border-gray-200"
              } ${dragOverIndex === index ? "border-blue-500 bg-blue-50" : ""} 
              ${draggedElement?.id === element.id ? "opacity-50" : "opacity-100"}
              cursor-pointer touch-manipulation ${element.isHidden ? "opacity-50" : ""}`}
              onClick={() => setActiveElement(element)}
              onDragStart={(e) => handleDragStart(e, element, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, element, index)}
              onTouchMove={(e) => handleTouchMove(e, index)}
              onTouchEnd={(e) => handleTouchEnd(e, index)}
              data-index={index}
              style={{
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                willChange: 'transform',
                touchAction: 'none',
              }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="cursor-grab flex items-center justify-center">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                
                {/* Replace the simple color block with our new thumbnail renderer */}
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
