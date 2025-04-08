
import { DesignElement } from "@/context/DesignContext";
import TextProperties from "./TextProperties";
import ShapeProperties from "./ShapeProperties";
import ImageProperties from "./ImageProperties";
import LayerProperties from "./LayerProperties";
import PositionProperties from "./PositionProperties";
import RotationProperty from "./RotationProperty";
import PuzzleProperties from "./PuzzleProperties";
import SequencePuzzleProperties from "./SequencePuzzleProperties";
import ClickSequencePuzzleProperties from "./ClickSequencePuzzleProperties";
import SliderPuzzleProperties from "./SliderPuzzleProperties";
import { InteractionProperties } from "./InteractionProperties";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ElementPropertiesProps {
  element: DesignElement;
}

const ElementProperties = ({ element }: ElementPropertiesProps) => {
  const textElements = ['heading', 'subheading', 'paragraph'];
  const shapeElements = ['rectangle', 'circle', 'triangle', 'line'];
  const puzzleElements = ['puzzle', 'sequencePuzzle', 'clickSequencePuzzle', 'sliderPuzzle'];
  
  // Don't show interaction properties for puzzle elements and backgrounds
  const canHaveInteraction = !puzzleElements.includes(element.type) && element.type !== 'background';
  
  return (
    <div className="properties-panel p-4 space-y-6">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      
      {canHaveInteraction ? (
        <Tabs defaultValue="properties">
          <TabsList className="w-full">
            <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
            <TabsTrigger value="interaction" className="flex-1">Interaction</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="space-y-6 pt-4">
            <PositionProperties element={element} />
            
            {element.size && <RotationProperty element={element} />}
            
            {textElements.includes(element.type) && <TextProperties element={element} />}
            
            {shapeElements.includes(element.type) && <ShapeProperties element={element} />}
            
            {element.type === 'image' && <ImageProperties element={element} />}
            
            <LayerProperties element={element} />
          </TabsContent>
          
          <TabsContent value="interaction" className="space-y-6 pt-4">
            <InteractionProperties element={element} />
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <PositionProperties element={element} />
          
          {element.size && <RotationProperty element={element} />}
          
          {textElements.includes(element.type) && <TextProperties element={element} />}
          
          {shapeElements.includes(element.type) && <ShapeProperties element={element} />}
          
          {element.type === 'image' && <ImageProperties element={element} />}
          
          {element.type === 'puzzle' && <PuzzleProperties element={element} />}
          
          {element.type === 'sequencePuzzle' && <SequencePuzzleProperties element={element} />}
          
          {element.type === 'clickSequencePuzzle' && <ClickSequencePuzzleProperties element={element} />}
          
          {element.type === 'sliderPuzzle' && <SliderPuzzleProperties element={element} />}
          
          <LayerProperties element={element} />
        </>
      )}
    </div>
  );
};

export default ElementProperties;
