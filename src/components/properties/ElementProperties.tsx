
import { useState } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import ShapeProperties from "./ShapeProperties";
import TextProperties from "./TextProperties";
import ImageProperties from "./ImageProperties";
import VideoProperties from "./VideoProperties";
import BackgroundProperties from "./BackgroundProperties";
import PuzzleProperties from "./PuzzleProperties";
import SequencePuzzleProperties from "./SequencePuzzleProperties";
import ClickSequencePuzzleProperties from "./ClickSequencePuzzleProperties";
import SliderPuzzleProperties from "./SliderPuzzleProperties";
import LayerControls from "./LayerControls";
import ElementInteractions from "./ElementInteractions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ElementPropertiesProps {
  element: DesignElement;
}

const ElementProperties = ({ element }: ElementPropertiesProps) => {
  const { updateElement } = useDesignState();
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const { t } = useLanguage();
  
  let specificProperties;
  
  if (['rectangle', 'circle', 'triangle', 'line'].includes(element.type)) {
    specificProperties = <ShapeProperties element={element} />;
  } else if (['heading', 'subheading', 'paragraph'].includes(element.type)) {
    specificProperties = <TextProperties element={element} />;
  } else if (element.type === 'image') {
    specificProperties = <ImageProperties element={element} />;
  } else if (element.type === 'video') {
    specificProperties = <VideoProperties element={element} />;
  } else if (element.type === 'background') {
    specificProperties = <BackgroundProperties element={element} />;
  } else if (element.type === 'puzzle') {
    specificProperties = <PuzzleProperties element={element} />;
  } else if (element.type === 'sequencePuzzle') {
    specificProperties = <SequencePuzzleProperties element={element} />;
  } else if (element.type === 'clickSequencePuzzle') {
    specificProperties = <ClickSequencePuzzleProperties element={element} />;
  } else if (element.type === 'sliderPuzzle') {
    specificProperties = <SliderPuzzleProperties element={element} />;
  }
  
  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    const updatedPosition = {
      ...element.position,
      [axis]: value
    };
    
    updateElement(element.id, { position: updatedPosition });
  };
  
  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    const updatedSize = {
      ...element.size,
      [dimension]: value
    };
    
    updateElement(element.id, { size: updatedSize });
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateElement(element.id, { name: e.target.value });
  };
  
  return (
    <div className="properties-panel border-l p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">{t('properties.title')}</h2>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="element-name">{t('properties.name')}</Label>
          <Input
            id="element-name"
            value={element.name || ''}
            onChange={handleNameChange}
            placeholder={t('properties.name.placeholder')}
          />
        </div>
        
        {specificProperties}

        <LayerControls element={element} />
        
        <Collapsible
          open={isPositionOpen}
          onOpenChange={setIsPositionOpen}
          className="border rounded-md p-2"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between items-center p-2">
              <span>{t('properties.position')}</span>
              {isPositionOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="position-x">X</Label>
                <Input
                  id="position-x"
                  type="number"
                  value={element.position.x}
                  onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="position-y">Y</Label>
                <Input
                  id="position-y"
                  type="number"
                  value={element.position.y}
                  onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {element.size && (
          <Collapsible
            open={isSizeOpen}
            onOpenChange={setIsSizeOpen}
            className="border rounded-md p-2"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between items-center p-2">
                <span>{t('properties.size')}</span>
                {isSizeOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="size-width">{t('properties.width')}</Label>
                  <Input
                    id="size-width"
                    type="number"
                    value={element.size.width}
                    onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="size-height">{t('properties.height')}</Label>
                  <Input
                    id="size-height"
                    type="number"
                    value={element.size.height}
                    onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        <ElementInteractions element={element} />
      </div>
    </div>
  );
};

export default ElementProperties;
