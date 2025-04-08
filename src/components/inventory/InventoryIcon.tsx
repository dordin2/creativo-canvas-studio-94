
import React from 'react';
import { Backpack } from 'lucide-react';
import { useDesignState } from '@/context/DesignContext';
import { cn } from '@/lib/utils';

export const InventoryIcon = () => {
  const { toggleInventory, showInventory, inventoryItems, isGameMode } = useDesignState();
  
  // Only show in game mode
  if (!isGameMode) return null;
  
  return (
    <div 
      className={cn(
        "absolute top-4 right-4 z-[100] bg-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-all animate-fade-in",
        showInventory && "bg-gray-200",
        inventoryItems.length > 0 && "after:content-[''] after:absolute after:w-4 after:h-4 after:bg-red-500 after:rounded-full after:-top-1 after:-right-1"
      )}
      onClick={toggleInventory}
    >
      <Backpack size={32} className={showInventory ? "text-canvas-purple" : "text-gray-800"} />
    </div>
  );
};

export default InventoryIcon;
