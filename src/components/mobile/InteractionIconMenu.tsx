
import { MessageSquare, Music, Navigation, ShoppingBasket, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InteractionIconMenuProps {
  onSelectInteractionType: (type: string) => void;
}

const InteractionIconMenu = ({ onSelectInteractionType }: InteractionIconMenuProps) => {
  return (
    <div className="flex gap-2 p-4 overflow-x-auto">
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => onSelectInteractionType('message')}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => onSelectInteractionType('sound')}
      >
        <Music className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => onSelectInteractionType('puzzle')}
      >
        <Puzzle className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => onSelectInteractionType('canvasNavigation')}
      >
        <Navigation className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => onSelectInteractionType('addToInventory')}
      >
        <ShoppingBasket className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default InteractionIconMenu;
