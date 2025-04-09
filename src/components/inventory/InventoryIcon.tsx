
import React from 'react';
import { Backpack } from 'lucide-react';
import { useDesignState } from '@/context/DesignContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export const InventoryIcon = () => {
  const { toggleInventory, showInventory, inventoryItems, isGameMode } = useDesignState();
  const isMobile = useIsMobile();
  
  // Only show in game mode
  if (!isGameMode) return null;
  
  return (
    <div 
      className={cn(
        "fixed top-4 right-4 z-[1000] bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-all animate-fade-in",
        isMobile ? "p-3" : "p-6",
        showInventory && "bg-gray-200",
        inventoryItems.length > 0 && "after:content-[''] after:absolute after:bg-red-500 after:rounded-full after:-top-2 after:-right-2",
        isMobile ? "after:w-5 after:h-5" : "after:w-7 after:h-7"
      )}
      onClick={toggleInventory}
    >
      <Backpack 
        size={isMobile ? 48 : 96} 
        className={showInventory ? "text-canvas-purple" : "text-gray-800"} 
      />
    </div>
  );
};

export default InventoryIcon;
