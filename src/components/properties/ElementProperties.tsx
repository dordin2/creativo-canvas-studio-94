import { DesignElement, useDesignState } from "@/context/DesignContext";
import ShapeProperties from "./ShapeProperties";
import TextProperties from "./TextProperties";
import ImageProperties from "./ImageProperties";
import PositionProperties from "./PositionProperties";
import RotationProperty from "./RotationProperty";
import LayerProperties from "./LayerProperties";
import LayersList from "../layers/LayersList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

const ElementProperties = ({ element }: { element: DesignElement }) => {
  const [activeTab, setActiveTab] = useState("style");
  const { removeElement } = useDesignState();
  const isMobile = useIsMobile();

  const handleDelete = () => {
    removeElement(element.id);
  };

  return (
    <div className="properties-panel border-l p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Properties</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="flex-1 flex flex-col space-y-6">
          {element.type !== 'background' && (
            <LayerProperties element={element} />
          )}

          {['rectangle', 'circle', 'triangle', 'line'].includes(element.type) && (
            <ShapeProperties element={element} />
          )}

          {['heading', 'subheading', 'paragraph'].includes(element.type) && (
            <TextProperties element={element} />
          )}

          {element.type === 'image' && (
            <ImageProperties element={element} />
          )}

          {element.type !== 'background' && (
            <PositionProperties element={element} />
          )}
        </TabsContent>
      </Tabs>

      <LayersList />
    </div>
  );
};

export default ElementProperties;
