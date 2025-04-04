
import { DesignElement } from "@/types/designTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShapeProperties from "./ShapeProperties";
import TextProperties from "./TextProperties";
import ImageProperties from "./ImageProperties";
import PositionProperties from "./PositionProperties";
import LayerProperties from "./LayerProperties";
import PuzzleProperties from "./PuzzleProperties";

const ElementProperties = ({ element }: { element: DesignElement }) => {
  const isText = ['heading', 'subheading', 'paragraph'].includes(element.type);
  const isShape = ['rectangle', 'circle', 'triangle', 'line'].includes(element.type);
  const isImage = element.type === 'image';
  const isPuzzle = element.type === 'puzzle';
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Element Properties</h2>
      
      <Tabs defaultValue="style" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="position">Position</TabsTrigger>
          <TabsTrigger value="layer">Layer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="style" className="py-4">
          {isShape && <ShapeProperties element={element} />}
          {isText && <TextProperties element={element} />}
          {isImage && <ImageProperties element={element} />}
          {isPuzzle && <PuzzleProperties element={element} />}
        </TabsContent>
        
        <TabsContent value="position" className="py-4">
          <PositionProperties element={element} />
        </TabsContent>
        
        <TabsContent value="layer" className="py-4">
          <LayerProperties element={element} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ElementProperties;
