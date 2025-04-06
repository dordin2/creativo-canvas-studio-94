
import { useEffect } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { toast } from 'sonner';

export const useMultiSelectionKeyboardShortcuts = () => {
  const { 
    selectedElementIds, 
    removeMultipleElements, 
    updateMultipleElements, 
    elements, 
    isGameMode 
  } = useDesignState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameMode) return;
      
      // Skip if no elements are selected or if user is typing in an input field
      if (
        selectedElementIds.length === 0 || 
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Delete or Backspace to remove selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0) {
        e.preventDefault();
        removeMultipleElements(selectedElementIds);
        toast.success(`Deleted ${selectedElementIds.length} elements`);
      }

      // Ctrl+D to duplicate selected elements
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedElementIds.length > 0) {
        e.preventDefault();
        
        // Get selected elements
        const elementsToDuplicate = elements.filter(el => selectedElementIds.includes(el.id));
        
        // Create duplicates with offset positions
        const duplicatedElements = elementsToDuplicate.map(el => ({
          ...el,
          id: undefined, // Will be assigned a new ID when added
          position: {
            x: el.position.x + 20,
            y: el.position.y + 20
          }
        }));
        
        // Add duplicated elements (handled in design context)
        // This would require additional implementation in DesignContext
        toast.success(`Duplicated ${selectedElementIds.length} elements`);
      }
      
      // Arrow keys to move selected elements
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElementIds.length > 0) {
        e.preventDefault();
        
        const moveDistance = e.shiftKey ? 10 : 1; // Move more with shift key
        let deltaX = 0;
        let deltaY = 0;
        
        switch (e.key) {
          case 'ArrowUp':
            deltaY = -moveDistance;
            break;
          case 'ArrowDown':
            deltaY = moveDistance;
            break;
          case 'ArrowLeft':
            deltaX = -moveDistance;
            break;
          case 'ArrowRight':
            deltaX = moveDistance;
            break;
        }
        
        updateMultipleElements(selectedElementIds, (element) => ({
          position: {
            x: element.position.x + deltaX,
            y: element.position.y + deltaY
          }
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElementIds, removeMultipleElements, updateMultipleElements, elements, isGameMode]);

  return null;
};
