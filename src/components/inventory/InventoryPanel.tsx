
import React from 'react';
import { useDesignState } from '@/context/DesignContext';
import InventoryItem from './InventoryItem';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const InventoryPanel = () => {
  const { showInventory, inventoryItems, toggleInventory, canvases, isGameMode } = useDesignState();
  
  // Only show in game mode and when inventory is open
  if (!isGameMode || !showInventory) return null;
  
  const getElement = (elementId: string, canvasId: string) => {
    const canvas = canvases.find(c => c.id === canvasId);
    if (!canvas) return null;
    
    return canvas.elements.find(el => el.id === elementId);
  };
  
  return (
    <div className="fixed top-16 right-4 z-[9999] bg-white rounded-lg shadow-xl w-80 max-h-[70vh] overflow-hidden flex flex-col animate-fade-in">
      <div className="p-3 bg-canvas-purple text-white flex justify-between items-center">
        <h3 className="font-semibold">Inventory</h3>
        <button 
          onClick={toggleInventory}
          className="hover:bg-white/20 rounded-full p-1"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className={cn(
        "p-4 grid grid-cols-3 gap-3 overflow-y-auto",
        inventoryItems.length === 0 && "flex items-center justify-center h-32"
      )}>
        {inventoryItems.length === 0 ? (
          <p className="text-gray-500 text-sm text-center col-span-3">Your inventory is empty</p>
        ) : (
          // Use a combined key from both elementId and canvasId to ensure uniqueness
          inventoryItems.map(item => {
            const element = getElement(item.elementId, item.canvasId);
            if (!element) return null;
            
            return (
              <InventoryItem 
                key={`${item.elementId}-${item.canvasId}`} 
                element={element} 
              />
            );
          })
        )}
      </div>
      <div className="p-3 bg-gray-50 border-t text-xs text-gray-500">
        <p>Drag and drop items onto combinable elements to use them</p>
      </div>
    </div>
  );
};

export default InventoryPanel;
