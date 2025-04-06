
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

interface ElementPropertiesProps {
  element: DesignElement;
}

const ElementProperties = ({ element }: ElementPropertiesProps) => {
  const textElements = ['heading', 'subheading', 'paragraph'];
  const shapeElements = ['rectangle', 'circle', 'triangle', 'line'];
  
  return (
    <div className="properties-panel p-4 space-y-6">
      <h2 className="text-lg font-semibold mb-4">Properties</h2>
      
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
    </div>
  );
};

export default ElementProperties;
