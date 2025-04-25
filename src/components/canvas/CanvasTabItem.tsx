
import { useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import { Canvas } from "@/types/designTypes";
import { cn } from "@/lib/utils";
import { Copy, Move, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CanvasTabItemProps {
  canvas: Canvas;
  index: number;
  isActive: boolean;
  isDragOver: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export const CanvasTabItem = ({
  canvas,
  index,
  isActive,
  isDragOver,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}: CanvasTabItemProps) => {
  const { setActiveCanvas, updateCanvasName, duplicateCanvas, removeCanvas, canvases } = useDesignState();
  const { language } = useLanguage();
  const [editingCanvasId, setEditingCanvasId] = useState<string | null>(null);
  const [newCanvasName, setNewCanvasName] = useState<string>('');

  const handleNameChange = (id: string, newName: string) => {
    updateCanvasName(id, newName);
    setEditingCanvasId(null);
  };

  return (
    <div 
      className={cn(
        "flex-shrink-0 flex items-center",
        isDragOver && "opacity-50"
      )}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <button
        className={cn(
          "flex items-center py-1 px-3 text-sm rounded-t-md border border-gray-300 transition-colors",
          isActive 
            ? "bg-white border-b-white font-medium text-canvas-purple" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          isDragging && "opacity-50 border-dashed"
        )}
        onClick={() => setActiveCanvas(index)}
      >
        <Move size={14} className="mr-1.5 cursor-move text-gray-500" />
        
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
              className="h-7 text-xs w-full"
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
          >
            {canvas.name}
          </span>
        )}
      </button>
      
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="ml-1 p-1 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateCanvas(index);
                }}
                title="Duplicate Canvas"
              >
                <Copy size={14} />
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
                  className="ml-1 p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCanvas(index);
                  }}
                  title="Remove Canvas"
                >
                  <X size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{language === 'he' ? 'הסר קנבס' : 'Remove Canvas'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
