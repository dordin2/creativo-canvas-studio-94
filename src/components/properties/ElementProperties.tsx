
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ElementPropertiesProps {
  element: DesignElement;
  isInteractiveMode?: boolean;
}

const ElementProperties = ({ element, isInteractiveMode }: ElementPropertiesProps) => {
  const textElements = ['heading', 'subheading', 'paragraph'];
  const shapeElements = ['rectangle', 'circle', 'triangle', 'line'];
  const puzzleElements = ['puzzle', 'sequencePuzzle', 'clickSequencePuzzle', 'sliderPuzzle'];
  
  // Don't show interaction properties for puzzle elements and backgrounds
  const canHaveInteraction = !puzzleElements.includes(element.type) && element.type !== 'background';

  if (isInteractiveMode) {
    return (
      <div className="p-6">
        <InteractionProperties element={element} />
      </div>
    );
  }

  return (
    <Tabs defaultValue="style" className="w-full">
      <TabsList className="w-full justify-center">
        <TabsTrigger value="style">Style</TabsTrigger>
        {canHaveInteraction && <TabsTrigger value="interaction">Interaction</TabsTrigger>}
      </TabsList>
      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="p-6">
          <TabsContent value="style">
            {textElements.includes(element.type) && <TextProperties element={element} />}
            {shapeElements.includes(element.type) && <ShapeProperties element={element} />}
            {element.type === 'image' && <ImageProperties element={element} />}
            {puzzleElements.includes(element.type) && (
              <>
                {element.type === 'puzzle' && <PuzzleProperties element={element} />}
                {element.type === 'sequencePuzzle' && <SequencePuzzleProperties element={element} />}
                {element.type === 'clickSequencePuzzle' && <ClickSequencePuzzleProperties element={element} />}
                {element.type === 'sliderPuzzle' && <SliderPuzzleProperties element={element} />}
              </>
            )}
            <LayerProperties element={element} />
          </TabsContent>
          {canHaveInteraction && (
            <TabsContent value="interaction">
              <InteractionProperties element={element} />
            </TabsContent>
          )}
        </div>
      </ScrollArea>
    </Tabs>
  );
};

export default ElementProperties;
