
import { useEffect } from 'react';
import { useDesignState } from '@/context/DesignContext';
import { toast } from 'sonner';

const useCanvasKeyboardShortcuts = () => {
  const { 
    activeElement, 
    removeElement, 
    updateElement,
    undo,
    redo,
    canUndo,
    canRedo
  } = useDesignState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when no input element is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      // Delete selected element
      if (e.key === 'Delete' && activeElement) {
        e.preventDefault();
        removeElement(activeElement.id);
        toast.success('Element deleted');
        return;
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          // Redo
          if (canRedo) {
            redo();
            toast.success('Redo successful');
          }
        } else {
          // Undo
          if (canUndo) {
            undo();
            toast.success('Undo successful');
          }
        }
        return;
      }

      // Arrow key movement for selected element
      if (activeElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        const moveDistance = e.shiftKey ? 10 : 1;
        const position = { ...activeElement.position };
        
        switch (e.key) {
          case 'ArrowUp':
            position.y -= moveDistance;
            break;
          case 'ArrowDown':
            position.y += moveDistance;
            break;
          case 'ArrowLeft':
            position.x -= moveDistance;
            break;
          case 'ArrowRight':
            position.x += moveDistance;
            break;
        }
        
        updateElement(activeElement.id, { position });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeElement, removeElement, updateElement, undo, redo, canUndo, canRedo]);

  return null;
};

export default useCanvasKeyboardShortcuts;
