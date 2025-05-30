
import { DesignElement } from "@/context/DesignContext";
import TextProperties from "./TextProperties";
import ShapeProperties from "./ShapeProperties";
import ImageProperties from "./ImageProperties";
import LayerProperties from "./LayerProperties";
import PuzzleProperties from "./PuzzleProperties";
import SequencePuzzleProperties from "./SequencePuzzleProperties";
import ClickSequencePuzzleProperties from "./ClickSequencePuzzleProperties";
import SliderPuzzleProperties from "./SliderPuzzleProperties";
import InteractionProperties from "./InteractionProperties";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ElementPropertiesProps {
  element: DesignElement;
  isInteractiveMode?: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

const ElementProperties = ({ element, isInteractiveMode, isDialogOpen, setIsDialogOpen }: ElementPropertiesProps) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const textElements = ['heading', 'subheading', 'paragraph'];
  const shapeElements = ['rectangle', 'circle', 'triangle', 'line'];
  const puzzleElements = ['puzzle', 'sequencePuzzle', 'clickSequencePuzzle', 'sliderPuzzle'];
  
  // Don't show interaction properties for puzzle elements and backgrounds
  const canHaveInteraction = !puzzleElements.includes(element.type) && element.type !== 'background';

  // Add global CSS for drag operations
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'global-drag-styles';
    styleElement.textContent = `
      body.inventory-dragging,
      body.sequence-dragging {
        cursor: none !important;
      }
      
      #sequence-item-preview {
        position: fixed;
        pointer-events: none;
        z-index: 10000;
        opacity: 0.9;
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      /* Add mobile-specific touch styles */
      @media (pointer: coarse) {
        .canvas-element {
          touch-action: none;
        }
      }
      
      /* Prevent scrolling when dragging elements */
      body.element-dragging {
        overflow: hidden;
        touch-action: none;
      }
    `;
    
    // Only add if it doesn't exist yet
    if (!document.getElementById('global-drag-styles')) {
      document.head.appendChild(styleElement);
    }
    
    return () => {
      // We don't remove it on unmount because other components might need it
    };
  }, []);
  
  // If not in interactive mode, don't render anything
  if (!isInteractiveMode) {
    return null;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className={`${isMobile ? 'w-[95%]' : 'max-w-[800px] w-[800px]'} max-h-[90vh] h-[800px] p-0 gap-0 overflow-hidden`}>
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

            <div className="flex-1 overflow-auto">
              <ScrollArea className="h-full max-h-[calc(90vh-120px)]">
                <div className="p-6">
                  <TabsContent value="interactions" className="m-0 h-full">
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
