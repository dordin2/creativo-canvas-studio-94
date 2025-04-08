
import React from 'react';
import { Backpack } from 'lucide-react';
import { useDesignState } from '@/context/DesignContext';
import { cn } from '@/lib/utils';

export const InventoryIcon = () => {
  const { toggleInventory, showInventory, inventoryItems } = useDesignState();
  
  return (
    <div 
      className={cn(
        "fixed top-4 right-4 z-50 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-all",
        showInventory && "bg-gray-200",
        inventoryItems.length > 0 && "after:content-[''] after:absolute after:w-3 after:h-3 after:bg-red-500 after:rounded-full after:-top-1 after:-right-1"
      )}
      onClick={toggleInventory}
    >
      <Backpack size={24} className={showInventory ? "text-canvas-purple" : "text-gray-800"} />
    </div>
  );
};

export default InventoryIcon;
