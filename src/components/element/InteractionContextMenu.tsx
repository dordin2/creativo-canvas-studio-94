import { MessageSquare, Music, Navigation, ShoppingBasket, Puzzle, Maximize2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { InteractionType } from "@/types/designTypes";
import { useInteractiveMode } from "@/context/InteractiveModeContext";

interface InteractionContextMenuProps {
  element: DesignElement;
  children: React.ReactNode;
}

const InteractionContextMenu = ({ element, children }: InteractionContextMenuProps) => {
  const { updateElement, canvases, activeCanvasIndex } = useDesignState();
  const { isInteractiveMode } = useInteractiveMode();

  const hasValidAspectRatio = () => {
    if (element.type !== 'image' || !element.originalSize) return false;
    const { width, height } = element.originalSize;
    const aspectRatio = width / height;
    const targetRatio = 16 / 9;
    const tolerance = 0.1;
    return Math.abs(aspectRatio - targetRatio) < tolerance;
  };

  const handleSetAsBackground = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const currentCanvas = canvases[activeCanvasIndex];
    if (currentCanvas) {
      const backgroundElement = currentCanvas.elements.find(el => el.layer === 0);
      if (backgroundElement) {
        updateElement(backgroundElement.id, {
          layer: Math.max(...currentCanvas.elements.map(el => el.layer)) + 1
        });
      }
    }
    
    updateElement(element.id, {
      position: { x: 0, y: 0 },
      size: { width: 1600, height: 900 },
      layer: 0
    });
  };

  if (isInteractiveMode) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {hasValidAspectRatio() && (
          <ContextMenuItem 
            onClick={handleSetAsBackground}
            className="flex items-center gap-2"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Set as Background</span>
          </ContextMenuItem>
        )}
        <ContextMenuItem 
          onClick={() => updateElement(element.id, { 
            interaction: { type: 'message' as InteractionType, message: '' }
          })}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Add Message</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => updateElement(element.id, { 
            interaction: { type: 'sound' as InteractionType, sound: '', soundUrl: '' }
          })}
          className="flex items-center gap-2"
        >
          <Music className="h-4 w-4" />
          <span>Add Sound</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => updateElement(element.id, { 
            interaction: { type: 'puzzle' as InteractionType, puzzleType: 'puzzle', puzzleConfig: {
              name: 'Puzzle',
              type: 'image',
              placeholders: 3,
              images: [],
              solution: []
            } }
          })}
          className="flex items-center gap-2"
        >
          <Puzzle className="h-4 w-4" />
          <span>Add Puzzle</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => updateElement(element.id, { 
            interaction: { type: 'canvasNavigation' as InteractionType, targetCanvasId: '' }
          })}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          <span>Add Navigation</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => updateElement(element.id, { 
            interaction: { type: 'addToInventory' as InteractionType }
          })}
          className="flex items-center gap-2"
        >
          <ShoppingBasket className="h-4 w-4" />
          <span>Add to Inventory</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default InteractionContextMenu;
