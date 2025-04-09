
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
        "fixed top-4 right-4 z-[1000] bg-card p-6 rounded-full shadow-lg cursor-pointer hover:bg-accent transition-all animate-fade-in",
        showInventory && "bg-accent",
        inventoryItems.length > 0 && "after:content-[''] after:absolute after:w-7 after:h-7 after:bg-primary after:rounded-full after:-top-2 after:-right-2"
      )}
      onClick={toggleInventory}
    >
      <Backpack size={192} className={showInventory ? "text-primary" : "text-foreground"} />
    </div>
  );
};

export default InventoryIcon;
