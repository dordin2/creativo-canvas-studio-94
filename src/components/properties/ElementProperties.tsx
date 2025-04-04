
import React from "react";
import { DesignElement } from "@/types/designTypes";
import PositionProperties from "./PositionProperties";
import ShapeProperties from "./ShapeProperties";
import TextProperties from "./TextProperties";
import ImageProperties from "./ImageProperties";
import LayerProperties from "./LayerProperties";
import RotationProperty from "./RotationProperty";
import PuzzleProperties from "./PuzzleProperties";
import SequencePuzzleProperties from "./SequencePuzzleProperties";
import ClickSequencePuzzleProperties from "./ClickSequencePuzzleProperties";

interface ElementPropertiesProps {
  element: DesignElement;
}

const ElementProperties: React.FC<ElementPropertiesProps> = ({ element }) => {
  // Determine which properties panel to show based on element type
  const renderPropertiesPanel = () => {
    switch (element.type) {
      case "rectangle":
      case "circle":
      case "triangle":
      case "line":
        return (
          <>
            <ShapeProperties element={element} />
            <PositionProperties element={element} />
            <RotationProperty element={element} />
            <LayerProperties element={element} />
          </>
        );
      
      case "heading":
      case "subheading":
      case "paragraph":
        return (
          <>
            <TextProperties element={element} />
            <PositionProperties element={element} />
            <RotationProperty element={element} />
            <LayerProperties element={element} />
          </>
        );
      
      case "image":
        return (
          <>
            <ImageProperties element={element} />
            <PositionProperties element={element} />
            <RotationProperty element={element} />
            <LayerProperties element={element} />
          </>
        );
      
      case "background":
        return (
          <>
            <ShapeProperties element={element} />
            <LayerProperties element={element} />
          </>
        );

      case "puzzle":
        return (
          <>
            <PuzzleProperties element={element} />
            <PositionProperties element={element} />
            <RotationProperty element={element} />
            <LayerProperties element={element} />
          </>
        );

      case "sequencePuzzle":
        return (
          <>
            <SequencePuzzleProperties element={element} />
            <PositionProperties element={element} />
            <RotationProperty element={element} />
            <LayerProperties element={element} />
          </>
        );
        
      case "clickSequencePuzzle":
        return (
          <>
            <ClickSequencePuzzleProperties element={element} />
            <PositionProperties element={element} />
            <RotationProperty element={element} />
            <LayerProperties element={element} />
          </>
        );
      
      default:
        return <div>No properties available for this element type.</div>;
    }
  };

  return (
    <div className="properties-panel border-l overflow-y-auto h-full p-4">
      <h2 className="text-lg font-bold mb-4">Properties</h2>
      {renderPropertiesPanel()}
    </div>
  );
};

export default ElementProperties;
