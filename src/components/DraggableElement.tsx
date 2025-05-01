import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DesignElement } from '@/types/designTypes';
import { useDesignState } from '@/context/DesignContext';
import { ItemTypes } from '@/types/dragTypes';
import { useTransform } from 'framer-motion';
import { useMotionValue } from 'framer-motion';
import { X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableElementProps {
  element: DesignElement;
  canvasRef: React.RefObject<HTMLDivElement>;
  zoomLevel: number;
  isSelected: boolean;
  isInteractive?: boolean;
  isGameMode?: boolean;
  onSelect: (element: DesignElement) => void;
  onReposition: (id: string, x: number, y: number) => void;
  onClick?: () => void;
}

export const DraggableElement = ({ 
  element,
  canvasRef,
  zoomLevel,
  isSelected,
  isInteractive,
  isGameMode,
  onSelect,
  onReposition,
  onClick,
}: DraggableElementProps) => {
  const { 
    removeElement, 
    activeElement, 
    setActiveElement,
    addToInventory,
    removeFromInventory,
    handleItemCombination
  } = useDesignState();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = React.useState(false);
  
  const motionX = useMotionValue(element.position.x);
  const motionY = useMotionValue(element.position.y);
  
  const x = useTransform(motionX, (val) => val * zoomLevel);
  const y = useTransform(motionY, (val) => val * zoomLevel);
  
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.ELEMENT,
    item: { id: element.id, type: ItemTypes.ELEMENT, initialPosition: element.position },
    canDrag: !element.isLocked && !isGameMode,
    end: (item, monitor) => {
      if (!canvasRef.current) return;
      
      const dropResult = monitor.getDropResult();
      if (dropResult && 'type' in dropResult && dropResult.type === 'inventory') {
        addToInventory(element.id);
        return;
      }
      
      if (monitor.didDrop()) return;
      
      if (item.initialPosition && elementRef.current) {
        const elementNode = elementRef.current;
        const canvasNode = canvasRef.current;
        
        const domRect = elementNode.getBoundingClientRect();
        const canvasRect = canvasNode.getBoundingClientRect();
        
        const x = domRect.x - canvasRect.x;
        const y = domRect.y - canvasRect.y;
        
        onReposition(element.id, x / zoomLevel, y / zoomLevel);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);
  
  useEffect(() => {
    motionX.set(element.position.x);
  }, [element.position.x, motionX]);
  
  useEffect(() => {
    motionY.set(element.position.y);
  }, [element.position.y, motionY]);
  
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isGameMode && element.inInventory) {
      removeFromInventory(element.id);
      return;
    }
    
    onSelect(element);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeElement(element.id);
  };
  
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isGameMode && activeElement && element.interaction?.canCombineWith?.length) {
      handleItemCombination(activeElement.id, element.id);
    }
  };

  // Handle rendering different types of elements
  const renderElement = () => {
    switch (element.type) {
      case 'image':
        return (
          <div className={cn(
            "relative w-full h-full overflow-hidden",
            element.isLoading && "animate-pulse"
          )}>
            {element.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}
            <img 
              src={element.dataUrl || element.src} 
              alt={element.name || "Image"} 
              className="w-full h-full object-contain" 
            />
          </div>
        );
      case 'text':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span style={element.style}>{element.name}</span>
          </div>
        );
      case 'button':
        return (
          <button className="w-full h-full bg-blue-500 text-white rounded-md hover:bg-blue-700">
            {element.name}
          </button>
        );
      case 'background':
        return (
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${element.src})` }} />
        );
      default:
        return <div className="w-full h-full bg-muted" />;
    }
  };

  return (
    <div
      ref={drag}
      style={{
        width: element.size.width * zoomLevel,
        height: element.size.height * zoomLevel,
        zIndex: element.layer,
        cursor: element.isLocked || isGameMode ? 'default' : 'grab',
      }}
      className="absolute top-0 left-0 touch-none"
    >
      <div
        ref={elementRef}
        style={{ x, y, transformOrigin: '0 0' }}
        className={cn(
          "relative w-full h-full select-none",
          isInteractive && "cursor-pointer",
          isDragging && "opacity-50",
          isSelected && "outline-2 outline-dashed outline-primary/50",
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleSelect}
      >
        {renderElement()}
        
        {!isGameMode && isSelected && isHovering && (
          <div className="absolute top-1 left-1 flex items-center justify-center">
            <button
              onClick={handleDelete}
              className="p-1 rounded-full bg-white/80 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
        
        {isGameMode && isSelected && isHovering && !element.inInventory && (
          <div className="absolute top-1 right-1 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToInventory(element.id);
              }}
              className="p-1 rounded-full bg-white/80 hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
