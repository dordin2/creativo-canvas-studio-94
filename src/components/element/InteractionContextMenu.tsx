
import { MessageSquare, Music, Navigation, ShoppingBasket, Puzzle } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { InteractionType } from "@/types/designTypes";

interface InteractionContextMenuProps {
  element: DesignElement;
  children: React.ReactNode;
}

const InteractionContextMenu = ({ element, children }: InteractionContextMenuProps) => {
  const { updateElement } = useDesignState();

  const handleInteractionSelect = (type: InteractionType) => {
    updateElement(element.id, {
      interaction: {
        type,
        ...(type === 'message' && { message: '' }),
        ...(type === 'sound' && { sound: '', soundUrl: '' }),
        ...(type === 'puzzle' && { 
          puzzleType: 'puzzle',
          puzzleConfig: {
            name: 'Puzzle',
            type: 'image',
            placeholders: 3,
            images: [],
            solution: []
          }
        }),
        ...(type === 'canvasNavigation' && { targetCanvasId: '' }),
      }
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem 
          onClick={() => handleInteractionSelect('message')}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Add Message</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => handleInteractionSelect('sound')}
          className="flex items-center gap-2"
        >
          <Music className="h-4 w-4" />
          <span>Add Sound</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => handleInteractionSelect('puzzle')}
          className="flex items-center gap-2"
        >
          <Puzzle className="h-4 w-4" />
          <span>Add Puzzle</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => handleInteractionSelect('canvasNavigation')}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          <span>Add Navigation</span>
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => handleInteractionSelect('addToInventory')}
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
