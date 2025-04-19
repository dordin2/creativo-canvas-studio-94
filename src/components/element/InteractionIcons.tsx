
import { MessageSquare, Navigation, ShoppingBasket, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesignElement } from "@/types/designTypes";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import InteractionProperties from "@/components/properties/InteractionProperties";
import { useIsMobile } from "@/hooks/use-mobile";

interface InteractionIconsProps {
  element: DesignElement;
}

const InteractionIcons = ({ element }: InteractionIconsProps) => {
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [selectedInteractionType, setSelectedInteractionType] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleInteractionClick = (type: string) => {
    setSelectedInteractionType(type);
    setShowInteractionModal(true);
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

  if (isMobile) {
    return (
      <>
        <Sheet open={showInteractionModal} onOpenChange={setShowInteractionModal}>
          <SheetTrigger asChild>
            <div className="w-full">
              <IconsRow />
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] w-full">
            <div className="pt-6">
              <InteractionProperties element={element} />
            </div>
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
          <InteractionProperties element={element} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractionIcons;
