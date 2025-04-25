
import { useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import InteractionProperties from "@/components/properties/InteractionProperties";
import { useLanguage } from "@/context/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const InteractionSettingsButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { activeElement } = useDesignState();
  const { language } = useLanguage();

  if (!activeElement) return null;

  return (
    <>
      <Button
        variant="outline"
        className="fixed top-24 right-4 z-50 bg-white"
        onClick={() => setIsDialogOpen(true)}
      >
        <Settings className="h-4 w-4 mr-2" />
        {language === 'en' ? 'Element Settings' : 'הגדרות אלמנט'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[800px] w-[800px] max-h-[800px] h-[800px] p-0 gap-0 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <DialogHeader className="flex flex-row items-center gap-4">
                <DialogTitle className="text-xl text-canvas-purple font-bold">
                  {language === 'en' ? 'Element Settings' : 'הגדרות אלמנט'}
                </DialogTitle>
              </DialogHeader>
              <DialogClose className="text-gray-700 hover:text-canvas-purple transition-colors" />
            </div>
            <ScrollArea className="flex-1 p-6">
              <InteractionProperties element={activeElement} />
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InteractionSettingsButton;
