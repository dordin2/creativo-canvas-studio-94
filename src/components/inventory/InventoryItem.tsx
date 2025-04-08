
import React, { useState, useEffect } from 'react';
import { useDesignState, DesignElement } from '@/context/DesignContext';
import { X, Image } from 'lucide-react';

interface InventoryItemProps {
  element: DesignElement;
}

const InventoryItem = ({ element }: InventoryItemProps) => {
  const { removeFromInventory, setDraggedInventoryItem, isGameMode } = useDesignState();
  const [isDragging, setIsDragging] = useState(false);
  
  // Track globally if any item is being dragged to change cursor back on document
  useEffect(() => {
    if (isDragging) {
      // Add dragging classes for styling
      document.body.classList.add('inventory-dragging');
      
      // Create and apply a custom cursor with item preview
      const cursorPreview = document.createElement('div');
      cursorPreview.id = 'cursor-preview';
      cursorPreview.className = 'fixed pointer-events-none z-[10000] opacity-90 scale-75 w-12 h-12 flex items-center justify-center bg-white rounded-md shadow-md';
      document.body.appendChild(cursorPreview);
      
      // Add content to the cursor preview based on element type
      let previewContent = '';
      
      switch (element.type) {
        case 'rectangle':
          previewContent = `<div class="h-10 w-10" style="background-color: ${element.style?.backgroundColor || '#8B5CF6'}; border-radius: ${element.style?.borderRadius || '4px'}"></div>`;
          break;
          
        case 'circle':
          previewContent = `<div class="h-10 w-10 rounded-full" style="background-color: ${element.style?.backgroundColor || '#8B5CF6'}"></div>`;
          break;
          
        case 'triangle':
          previewContent = `<div style="width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-bottom: 30px solid ${element.style?.backgroundColor || '#8B5CF6'}; background-color: transparent;"></div>`;
          break;
          
        case 'image':
          if (element.dataUrl) {
            previewContent = `<img src="${element.dataUrl}" alt="Item" class="w-full h-full object-contain" />`;
          } else if (element.src) {
            previewContent = `<img src="${element.src}" alt="Item" class="w-full h-full object-contain" />`;
          } else {
            previewContent = `<div class="w-full h-full bg-gray-200 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`;
          }
          break;
          
        case 'heading':
        case 'subheading':
        case 'paragraph':
          previewContent = `<div class="w-full h-full flex items-center justify-center text-xs overflow-hidden font-semibold">${element.content?.substring(0, 5) || 'Text'}...</div>`;
          break;
          
        case 'puzzle':
        case 'sequencePuzzle':
        case 'sliderPuzzle':
          previewContent = `<div class="w-full h-full flex items-center justify-center">
            <div class="h-8 w-8 bg-canvas-purple rounded-md flex items-center justify-center text-white text-xs">Puzzle</div>
          </div>`;
          break;
          
        default:
          previewContent = `<div class="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">Item</div>`;
      }
      
      cursorPreview.innerHTML = previewContent;
      
      // Move custom cursor with mouse
      const movePreview = (e: MouseEvent) => {
        if (cursorPreview) {
          cursorPreview.style.left = `${e.clientX + 10}px`;
          cursorPreview.style.top = `${e.clientY + 10}px`;
        }
      };
      
      document.addEventListener('mousemove', movePreview);
      
      // Handle drag end by listening for mouseup globally
      const handleMouseUp = () => {
        setIsDragging(false);
        setDraggedInventoryItem(null);
        document.body.classList.remove('inventory-dragging');
        document.removeEventListener('mousemove', movePreview);
        document.removeEventListener('mouseup', handleMouseUp);
        
        if (cursorPreview && cursorPreview.parentNode) {
          cursorPreview.parentNode.removeChild(cursorPreview);
        }
      };
      
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.body.classList.remove('inventory-dragging');
        document.removeEventListener('mousemove', movePreview);
        document.removeEventListener('mouseup', handleMouseUp);
        
        if (cursorPreview && cursorPreview.parentNode) {
          cursorPreview.parentNode.removeChild(cursorPreview);
        }
      };
    }
  }, [isDragging, element, setDraggedInventoryItem]);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isGameMode) return;
    
    // Set a transparent drag image
    const ghost = document.createElement('div');
    ghost.style.width = '1px';
    ghost.style.height = '1px';
    ghost.style.background = 'transparent';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    
    // Set dragged data
    e.dataTransfer.setData('application/inventory-item', element.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Update state
    setIsDragging(true);
    setDraggedInventoryItem(element);
    
    // Remove ghost element after a short delay
    setTimeout(() => {
      if (ghost.parentNode) {
        ghost.parentNode.removeChild(ghost);
      }
    }, 100);
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
      className={`relative bg-gray-50 border rounded-md p-1 h-20 flex items-center justify-center shadow-sm group ${isGameMode ? 'cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'opacity-30' : ''}`}
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
      
      <div className={`w-full h-full overflow-hidden flex items-center justify-center`}>
        {renderThumbnail()}
      </div>
    </div>
  );
};

export default InventoryItem;
