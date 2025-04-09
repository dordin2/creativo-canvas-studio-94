
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
    <div className="fixed top-20 right-4 z-[9999] bg-white rounded-lg shadow-xl w-[320px] h-[70vh] max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
      <div className="p-6 bg-canvas-purple text-white flex justify-between items-center">
        <h3 className="font-semibold text-xl">Inventory</h3>
        <button 
          onClick={toggleInventory}
          className="hover:bg-white/20 rounded-full p-2"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className={cn(
        "p-6 grid grid-cols-2 gap-6 overflow-y-auto",
        inventoryItems.length === 0 && "flex items-center justify-center h-64"
      )}>
        {inventoryItems.length === 0 ? (
          <p className="text-gray-500 text-base text-center col-span-2">Your inventory is empty</p>
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
      <div className="p-6 bg-gray-50 border-t text-sm text-gray-500">
        <p>Drag and drop items onto combinable elements to use them</p>
      </div>
    </div>
  );
};

export default InventoryPanel;
