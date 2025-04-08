
import React, { useState } from 'react';
import { useDesignState, DesignElement } from '@/context/DesignContext';
import { X } from 'lucide-react';

interface InventoryItemProps {
  element: DesignElement;
}

const InventoryItem = ({ element }: InventoryItemProps) => {
  const { removeFromInventory, setDraggedInventoryItem, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isGameMode) return;
    
    // Set a ghost drag image
    const ghost = document.createElement('div');
    ghost.style.width = '40px';
    ghost.style.height = '40px';
    ghost.style.background = 'transparent';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);
    
    // Set dragged data
    e.dataTransfer.setData('application/inventory-item', element.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Update state
    setIsDragging(true);
    setDraggedInventoryItem(element);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedInventoryItem(null);
  };
  
  const renderThumbnail = () => {
    switch (element.type) {
      case 'rectangle':
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor: element.style?.backgroundColor as string || '#8B5CF6',
              borderRadius: element.style?.borderRadius || '4px'
            }}
          />
        );
        
      case 'circle':
        return (
          <div
            className="h-full w-full rounded-full"
            style={{
              backgroundColor: element.style?.backgroundColor as string || '#8B5CF6'
            }}
          />
        );
        
      case 'triangle':
        return (
          <div
            className="absolute"
            style={{
              width: 0,
              height: 0,
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderBottom: `30px solid ${element.style?.backgroundColor as string || '#8B5CF6'}`,
              backgroundColor: 'transparent'
            }}
          />
        );
        
      case 'image':
        return element.dataUrl ? (
          <img 
            src={element.dataUrl} 
            alt="Item" 
            className="w-full h-full object-contain" 
          />
        ) : element.src ? (
          <img 
            src={element.src} 
            alt="Item" 
            className="w-full h-full object-contain" 
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
            No image
          </div>
        );
        
      case 'heading':
      case 'subheading':
      case 'paragraph':
        return (
          <div className="w-full h-full flex items-center justify-center text-xs overflow-hidden">
            {element.content?.substring(0, 20) || 'Text'}
          </div>
        );
        
      default:
        return (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
            Item
          </div>
        );
    }
  };
  
  return (
    <div 
      className={`relative bg-gray-50 border rounded-md p-1 h-20 flex items-center justify-center shadow-sm group ${isGameMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
      draggable={isGameMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => removeFromInventory(element.id)}
          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className={`w-full h-full overflow-hidden flex items-center justify-center ${isDragging ? 'opacity-50' : ''}`}>
        {renderThumbnail()}
      </div>
    </div>
  );
};

export default InventoryItem;
