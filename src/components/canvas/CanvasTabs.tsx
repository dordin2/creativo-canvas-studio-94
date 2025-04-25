
import { useDesignState } from "@/context/DesignContext";
import { Button } from "@/components/ui/button";
import { Plus, X, Copy, ArrowLeft, ArrowRight, Move } from "lucide-react";
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
import { CanvasTabItem } from "./CanvasTabItem";

const CanvasTabs = () => {
  const { 
    canvases, 
    activeCanvasIndex, 
    setActiveCanvas, 
    addCanvas,
    reorderCanvases
  } = useDesignState();
  const { language } = useLanguage();
  
  // For drag and drop functionality
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    // Add a transparent drag ghost image
    const dragGhost = document.createElement('div');
    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-1000px';
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 0, 0);
    
    setDraggingIndex(index);
    
    // Store the index in the dataTransfer to use during drop
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

  // Clean up any ghost elements when component unmounts
  useEffect(() => {
    return () => {
      const ghosts = document.querySelectorAll('div[style*="position: absolute; top: -1000px"]');
      ghosts.forEach(ghost => ghost.remove());
    };
  }, []);

  return (
    <div 
      className={`flex items-center gap-1 p-2 overflow-x-auto ${language === 'he' ? 'rtl' : 'ltr'}`}
      ref={tabsRef}
    >
      {canvases.map((canvas, index) => (
        <CanvasTabItem 
          key={canvas.id}
          canvas={canvas}
          index={index}
          isActive={activeCanvasIndex === index}
          isDragOver={dragOverIndex === index}
          isDragging={draggingIndex === index}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        />
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 ml-2 gap-1"
        onClick={addCanvas}
      >
        <Plus size={16} />
        <span>{language === 'he' ? 'הוסף קאנבס' : 'Add Canvas'}</span>
      </Button>
    </div>
  );
};

export default CanvasTabs;
