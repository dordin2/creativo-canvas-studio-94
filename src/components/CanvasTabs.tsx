
import { useDesignState } from "@/context/DesignContext";
import { Button } from "@/components/ui/button";
import { Plus, Copy, X, Move } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CanvasTabs = () => {
  const { 
    canvases, 
    activeCanvasIndex, 
    setActiveCanvas, 
    addCanvas,
    removeCanvas,
    updateCanvasName,
    duplicateCanvas,
    reorderCanvases
  } = useDesignState();
  const { language } = useLanguage();
  const [editingCanvasId, setEditingCanvasId] = useState<string | null>(null);
  const [newCanvasName, setNewCanvasName] = useState<string>('');
  
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleNameChange = (id: string, newName: string) => {
    updateCanvasName(id, newName);
    setEditingCanvasId(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    const dragGhost = document.createElement('div');
    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-1000px';
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 0, 0);
    
    setDraggingIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggingIndex !== null && draggingIndex !== targetIndex) {
      reorderCanvases(draggingIndex, targetIndex);
    }
    
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  useEffect(() => {
    return () => {
      const ghosts = document.querySelectorAll('div[style*="position: absolute; top: -1000px"]');
      ghosts.forEach(ghost => ghost.remove());
    };
  }, []);

  return (
    <div 
      className="flex items-center gap-0.5 px-1 overflow-x-auto border-b border-gray-100/20 bg-white/30 backdrop-blur-[2px]"
      ref={tabsRef}
    >
      {canvases.map((canvas, index) => (
        <div 
          key={canvas.id} 
          className={cn(
            "flex-shrink-0 flex items-center",
            dragOverIndex === index && "opacity-50"
          )}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          <button
            className={cn(
              "flex items-center gap-0.5 py-0.5 px-1.5 text-[11px] rounded transition-all duration-200",
              activeCanvasIndex === index 
                ? "text-canvas-purple bg-white/70 shadow-sm ring-1 ring-gray-200/30" 
                : "text-gray-500 hover:text-gray-700 hover:bg-white/40",
              draggingIndex === index && "opacity-50 border-dashed"
            )}
            onClick={() => setActiveCanvas(index)}
          >
            <Move size={10} className="cursor-move text-gray-400" />
            
            {editingCanvasId === canvas.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNameChange(canvas.id, newCanvasName);
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 min-w-0"
              >
                <Input
                  type="text"
                  value={newCanvasName}
                  onChange={(e) => setNewCanvasName(e.target.value)}
                  className="h-5 text-[11px] w-20"
                  autoFocus
                  onBlur={() => handleNameChange(canvas.id, newCanvasName || canvas.name)}
                />
              </form>
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingCanvasId(canvas.id);
                  setNewCanvasName(canvas.name);
                }}
                className="truncate max-w-[80px]"
              >
                {canvas.name}
              </span>
            )}

            <div className="flex items-center gap-px">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-0.5 text-gray-400 hover:text-blue-500 rounded hover:bg-white/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateCanvas(index);
                      }}
                    >
                      <Copy size={10} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'he' ? 'שכפול קנבס' : 'Duplicate Canvas'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {canvases.length > 1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="p-0.5 text-gray-400 hover:text-red-500 rounded hover:bg-white/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCanvas(index);
                        }}
                      >
                        <X size={10} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{language === 'he' ? 'הסר קנבס' : 'Remove Canvas'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </button>
        </div>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 ml-0.5 gap-0.5 h-5 text-[11px] text-gray-500 hover:text-gray-700 hover:bg-white/40"
        onClick={addCanvas}
      >
        <Plus size={10} />
        <span>{language === 'he' ? 'הוסף קאנבס' : 'Add Canvas'}</span>
      </Button>
    </div>
  );
};

export default CanvasTabs;

