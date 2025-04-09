
import React from 'react';
import { useDesignState } from '@/context/DesignContext';
import InventoryItem from './InventoryItem';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

const InventoryPanel: React.FC = () => {
  const { inventoryItems, canvases, showInventory, toggleInventory } = useDesignState();
  
  // Get all elements in the inventory
  const getInventoryElements = () => {
    return inventoryItems.map(item => {
      const canvas = canvases.find(c => c.id === item.canvasId);
      if (!canvas) return null;
      
      const element = canvas.elements.find(e => e.id === item.elementId);
      return element || null;
    }).filter(Boolean);
  };
  
  const inventoryElements = getInventoryElements();
  
  if (!showInventory) return null;
  
  return (
    <div className="inventory-panel fixed bottom-16 right-4 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in slide-in-from-bottom-10 duration-150">
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700">Inventory</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleInventory} 
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {inventoryElements.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">
          Your inventory is empty
        </div>
      ) : (
        <div className="p-3 grid grid-cols-3 gap-8">
          {inventoryElements.map(element => (
            element && (
              <InventoryItem 
                key={element.id} 
                element={element} 
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
