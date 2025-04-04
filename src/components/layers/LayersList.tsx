
import { useState } from "react";
import { useDesignState } from "@/context/DesignContext";
import LayersHeader from "./LayersHeader";
import LayerItem from "./LayerItem";
import EmptyLayersList from "./EmptyLayersList";

const LayersList = () => {
  const { elements, activeElement, setActiveElement } = useDesignState();

  // Filter out background element and sort by layer (highest first)
  const layerElements = [...elements]
    .filter(element => element.type !== 'background')
    .sort((a, b) => b.layer - a.layer);

  return (
    <div className="border rounded-md p-4 mt-4">
      <LayersHeader />

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {layerElements.length === 0 ? (
          <EmptyLayersList />
        ) : (
          layerElements.map((element) => (
            <LayerItem 
              key={element.id} 
              element={element} 
              isActive={activeElement?.id === element.id}
              onSelect={() => setActiveElement(element)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LayersList;
