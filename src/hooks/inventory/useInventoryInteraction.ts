
import { useState } from 'react';
import { DesignElement } from "@/types/designTypes";
import { useDesignState } from '@/context/DesignContext';
import { toast } from 'sonner';

export function useInventoryInteraction(element: DesignElement) {
  const { 
    inventoryItems, 
    handleItemCombination: contextHandleItemCombination,
    setActiveCanvas,
    canvases
  } = useDesignState();
  
  const isInInventory = element.inInventory || inventoryItems.some(item => item.elementId === element.id);
  
  const handleCombinationResult = (draggedItemId: string) => {
    if (!element.interaction?.combinationResult) return;
    
    const result = element.interaction.combinationResult;
    
    switch (result.type) {
      case 'message':
        if (result.message) {
          toast.success(result.message);
        }
        break;
        
      case 'sound':
        if (result.soundUrl) {
          const audio = new Audio(result.soundUrl);
          audio.play().catch(err => {
            console.error('Audio playback error:', err);
            toast.error('Could not play sound');
          });
        }
        break;
        
      case 'canvasNavigation':
        if (result.targetCanvasId) {
          const targetCanvasIndex = canvases.findIndex(
            canvas => canvas.id === result.targetCanvasId
          );
          
          if (targetCanvasIndex !== -1) {
            setActiveCanvas(targetCanvasIndex);
            toast.success(`Navigated to ${canvases[targetCanvasIndex].name}`);
          } else {
            toast.error('Target canvas not found');
          }
        }
        break;
        
      case 'puzzle':
        toast.info("Puzzle unlocked!");
        break;
        
      default:
        toast.success("Items combined successfully!");
        break;
    }
    
    // Trigger the actual item combination in the DesignContext
    handleItemCombination(draggedItemId, element.id);
  };
  
  const handleItemCombination = (inventoryItemId: string, targetElementId: string) => {
    contextHandleItemCombination(inventoryItemId, targetElementId);
  };
  
  return {
    isInInventory,
    handleCombinationResult,
    handleItemCombination
  };
}
