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
import { DesignElement } from "@/types/designTypes";
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
  const dragStartPosition = useRef<{ x: number, y: number } | null>(null);
  const cursorPreviewRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const layerElements = [...elements]
    .filter(element => element.type !== 'background')
    .sort((a, b) => b.layer - a.layer);

  const handleNameChange = (elementId: string, newName: string) => {
    updateElement(elementId, { name: newName });
    setEditingNameId(null);
  };

  const handleDuplicate = (element: DesignElement) => {
    console.log("LayersList - Original element to duplicate:", element);
    
    const duplicateProps = prepareElementForDuplication(element);
    
    console.log("LayersList - Duplicate props before adding:", duplicateProps);
    
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

  const renderElementThumbnail = (element: DesignElement) => {
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

  const handleMouseDown = (e: React.MouseEvent, element: DesignElement, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStartPosition.current = { x: e.clientX, y: e.clientY };
    
    setDraggedElement(element);
    isDraggingRef.current = true;
    
    const thumbnail = document.createElement('div');
    thumbnail.id = 'drag-thumbnail';
    thumbnail.style.position = 'fixed';
    thumbnail.style.pointerEvents = 'none';
    thumbnail.style.zIndex = '9999';
    thumbnail.style.left = `${e.clientX}px`;
    thumbnail.style.top = `${e.clientY}px`;
    thumbnail.style.transform = 'translate(-50%, -50%)';
    thumbnail.style.opacity = '0.8';
    thumbnail.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    thumbnail.style.borderRadius = '4px';
    thumbnail.style.background = 'white';
    thumbnail.style.padding = '6px';
    thumbnail.style.display = 'flex';
    thumbnail.style.alignItems = 'center';
    thumbnail.style.gap = '8px';
    
    const thumbnailContent = document.createElement('div');
    thumbnailContent.style.display = 'flex';
    thumbnailContent.style.alignItems = 'center';
    thumbnailContent.style.gap = '8px';
    
    const elementThumb = document.createElement('div');
    elementThumb.style.width = '20px';
    elementThumb.style.height = '20px';
    elementThumb.style.flexShrink = '0';
    
    switch(element.type) {
      case 'rectangle':
        elementThumb.style.backgroundColor = (element.style?.backgroundColor as string) || '#8B5CF6';
        elementThumb.style.borderRadius = (element.style?.borderRadius as string) || '0';
        break;
      case 'circle':
        elementThumb.style.backgroundColor = (element.style?.backgroundColor as string) || '#8B5CF6';
        elementThumb.style.borderRadius = '50%';
        break;
      case 'triangle':
        elementThumb.style.width = '0';
        elementThumb.style.height = '0';
        elementThumb.style.borderLeft = '10px solid transparent';
        elementThumb.style.borderRight = '10px solid transparent';
        elementThumb.style.borderBottom = `20px solid ${(element.style?.backgroundColor as string) || '#8B5CF6'}`;
        break;
      case 'image':
        if (element.dataUrl) {
          elementThumb.style.backgroundImage = `url(${element.dataUrl})`;
          elementThumb.style.backgroundSize = 'cover';
          elementThumb.style.backgroundPosition = 'center';
        } else {
          elementThumb.style.backgroundColor = '#e2e8f0';
          elementThumb.textContent = 'IMG';
          elementThumb.style.display = 'flex';
          elementThumb.style.alignItems = 'center';
          elementThumb.style.justifyContent = 'center';
          elementThumb.style.fontSize = '8px';
          elementThumb.style.color = '#64748b';
        }
        break;
      default:
        elementThumb.style.backgroundColor = (element.style?.backgroundColor as string) || '#8B5CF6';
        break;
    }
    
    const elementName = document.createElement('span');
    elementName.textContent = getElementName(element);
    elementName.style.fontSize = '12px';
    elementName.style.fontWeight = '500';
    elementName.style.whiteSpace = 'nowrap';
    elementName.style.maxWidth = '100px';
    elementName.style.overflow = 'hidden';
    elementName.style.textOverflow = 'ellipsis';
    
    thumbnailContent.appendChild(elementThumb);
    thumbnailContent.appendChild(elementName);
    thumbnail.appendChild(thumbnailContent);
    document.body.appendChild(thumbnail);
    cursorPreviewRef.current = thumbnail;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      if (thumbnail) {
        thumbnail.style.left = `${moveEvent.clientX}px`;
        thumbnail.style.top = `${moveEvent.clientY}px`;
      }
      
      const layerItems = document.querySelectorAll('[data-layer-index]');
      let foundDropTarget = false;
      
      layerItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const layerIndex = parseInt((item as HTMLElement).dataset.layerIndex || '-1');
        
        if (
          moveEvent.clientX >= rect.left &&
          moveEvent.clientX <= rect.right &&
          moveEvent.clientY >= rect.top &&
          moveEvent.clientY <= rect.bottom &&
          layerIndex !== -1
        ) {
          setDragOverIndex(layerIndex);
          foundDropTarget = true;
        }
      });
      
      if (!foundDropTarget) {
        setDragOverIndex(null);
      }
    };
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      isDraggingRef.current = false;
      
      if (thumbnail && thumbnail.parentNode) {
        thumbnail.parentNode.removeChild(thumbnail);
      }
      
      if (dragOverIndex !== null && draggedElement) {
        const sourceIndex = layerElements.findIndex(el => el.id === draggedElement.id);
        
        if (sourceIndex !== -1 && sourceIndex !== dragOverIndex) {
          const currentCanvas = canvases[activeCanvasIndex];
          if (!currentCanvas) return;

          const updatedElements = [...currentCanvas.elements];
          
          const newElements = updateElementsOrder(updatedElements, sourceIndex, dragOverIndex, layerElements);
          
          const updatedCanvases = [...canvases];
          updatedCanvases[activeCanvasIndex] = {
            ...currentCanvas,
            elements: newElements
          };
          
          setCanvases(updatedCanvases);
        }
      }
      
      setDraggedElement(null);
      setDragOverIndex(null);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
          layerElements.map((element, index) => (
            <div 
              key={element.id}
              data-layer-index={index}
              className={`p-2 border rounded-md flex items-center justify-between ${
                activeElement?.id === element.id ? "border-canvas-purple bg-purple-50" : "border-gray-200"
              } ${dragOverIndex === index ? "border-blue-500 bg-blue-50" : ""} 
              ${draggedElement?.id === element.id ? "opacity-50" : "opacity-100"}
              cursor-pointer ${element.isHidden ? "opacity-50" : ""}`}
              onClick={() => setActiveElement(element)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div 
                  className="cursor-grab flex items-center justify-center"
                  onMouseDown={(e) => handleMouseDown(e, element, index)}
                >
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
