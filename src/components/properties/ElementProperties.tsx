
import { DesignElement } from "@/context/DesignContext";
import InteractionProperties from "./InteractionProperties";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ElementPropertiesProps {
  element: DesignElement;
  isInteractiveMode?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ElementProperties = ({ element, isInteractiveMode, isOpen, onOpenChange }: ElementPropertiesProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { language } = useLanguage();
  
  const isDialogOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const handleOpenChange = onOpenChange || setInternalIsOpen;

  const puzzleElements = ['puzzle', 'sequencePuzzle', 'clickSequencePuzzle', 'sliderPuzzle'];
  const canHaveInteraction = !puzzleElements.includes(element.type) && element.type !== 'background';

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[800px] w-[800px] max-h-[800px] h-[800px] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <DialogHeader className="flex flex-row items-center gap-4">
              <DialogTitle className="text-xl text-canvas-purple font-bold">
                {language === 'en' ? 'Element Settings' : 'הגדרות אלמנט'}
              </DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <button
                className="text-gray-700 hover:text-canvas-purple transition-colors"
                aria-label={language === 'en' ? 'Close menu' : 'סגור תפריט'}
              >
                <X size={28} />
              </button>
            </DialogClose>
          </div>

          <Tabs defaultValue="interactions" className="flex-1 flex flex-col">
            <div className="border-b bg-white">
              <TabsList className="w-full justify-center h-12 bg-transparent gap-4">
                <TabsTrigger 
                  value="interactions" 
                  className="data-[state=active]:bg-transparent data-[state=active]:text-canvas-purple"
                >
                  {language === 'en' ? 'Interactions' : 'אינטראקציות'}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <TabsContent value="interactions" className="m-0">
                    <InteractionProperties element={element} />
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ElementProperties;
