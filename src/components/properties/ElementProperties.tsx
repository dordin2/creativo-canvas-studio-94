
import { DesignElement } from "@/types/designTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import ShapeProperties from "./ShapeProperties";
import TextProperties from "./TextProperties";
import ImageProperties from "./ImageProperties";
import PositionProperties from "./PositionProperties";
import LayerProperties from "./LayerProperties";
import PuzzleProperties from "./PuzzleProperties";
import SequencePuzzleProperties from "./SequencePuzzleProperties";
import ClickSequencePuzzleProperties from "./ClickSequencePuzzleProperties";

const ElementProperties = ({ element }: { element: DesignElement }) => {
  const { t, language } = useLanguage();
  
  const isText = ['heading', 'subheading', 'paragraph'].includes(element.type);
  const isShape = ['rectangle', 'circle', 'triangle', 'line'].includes(element.type);
  const isImage = element.type === 'image';
  const isPuzzle = element.type === 'puzzle';
  const isSequencePuzzle = element.type === 'sequencePuzzle';
  const isClickSequencePuzzle = element.type === 'clickSequencePuzzle';
  
  return (
    <div className={`p-4 ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <h2 className="text-lg font-medium mb-4">{t('properties.element')}</h2>
      
      <Tabs defaultValue="style" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="style">{t('properties.style')}</TabsTrigger>
          <TabsTrigger value="position">{t('properties.position')}</TabsTrigger>
          <TabsTrigger value="layer">{t('properties.layer')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="style" className="py-4">
          {isShape && <ShapeProperties element={element} />}
          {isText && <TextProperties element={element} />}
          {isImage && <ImageProperties element={element} />}
          {isPuzzle && <PuzzleProperties element={element} />}
          {isSequencePuzzle && <SequencePuzzleProperties element={element} />}
          {isClickSequencePuzzle && <ClickSequencePuzzleProperties element={element} />}
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
