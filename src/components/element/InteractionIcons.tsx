
import { MessageSquare, Navigation, ShoppingBasket, Puzzle, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesignElement } from "@/types/designTypes";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import MessageInteractionProperties from "@/components/properties/MessageInteractionProperties";
import SoundInteractionProperties from "@/components/properties/SoundInteractionProperties";
import { useDesignState } from "@/context/DesignContext";

interface InteractionIconsProps {
  element: DesignElement;
}

const InteractionIcons = ({ element }: InteractionIconsProps) => {
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [selectedInteractionType, setSelectedInteractionType] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { updateElement } = useDesignState();

  const handleInteractionClick = (type: string) => {
    setSelectedInteractionType(type);
    setShowInteractionModal(true);
    
    // Update the interaction type when icon is clicked
    updateElement(element.id, {
      interaction: {
        ...element.interaction,
        type: type as any
      }
    });
  };

  const getInteractionTitle = () => {
    switch (selectedInteractionType) {
      case 'message':
        return 'Message Settings';
      case 'sound':
        return 'Sound Settings';
      case 'canvasNavigation':
        return 'Navigation Settings';
      case 'addToInventory':
        return 'Inventory Settings';
      case 'puzzle':
        return 'Puzzle Settings';
      default:
        return 'Interaction Settings';
    }
  };

  const getInteractionContent = () => {
    if (!element) return null;

    const handleUpdate = (updates: Partial<DesignElement>) => {
      updateElement(element.id, updates);
    };

    switch (selectedInteractionType) {
      case 'message':
        return <MessageInteractionProperties element={element} onUpdate={handleUpdate} />;
      case 'sound':
        return <SoundInteractionProperties element={element} onUpdate={handleUpdate} />;
      default:
        return null;
    }
  };

  const IconsRow = () => (
    <div className={`flex gap-2 ${isMobile ? 'justify-center p-2' : ''} bg-white rounded-lg shadow-lg`}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleInteractionClick('message')}
        className="h-8 w-8"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleInteractionClick('sound')}
        className="h-8 w-8"
      >
        <Music className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleInteractionClick('canvasNavigation')}
        className="h-8 w-8"
      >
        <Navigation className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleInteractionClick('addToInventory')}
        className="h-8 w-8"
      >
        <ShoppingBasket className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleInteractionClick('puzzle')}
        className="h-8 w-8"
      >
        <Puzzle className="h-4 w-4" />
      </Button>
    </div>
  );

  const interactionContent = (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{getInteractionTitle()}</DialogTitle>
      </DialogHeader>
      {getInteractionContent()}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="w-full">
          <IconsRow />
        </div>
        <Sheet open={showInteractionModal} onOpenChange={setShowInteractionModal}>
          <SheetContent side="bottom" className="h-[90vh] w-full">
            {interactionContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50">
      <IconsRow />
      <Dialog open={showInteractionModal} onOpenChange={setShowInteractionModal}>
        <DialogContent className="sm:max-w-[600px]">
          {interactionContent}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractionIcons;
