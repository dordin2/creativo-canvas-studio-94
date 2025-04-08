
import React, { useState } from "react";
import { DesignElement } from "@/context/DesignContext";
import { SliderPuzzleModal } from "./SliderPuzzleModal";
import { Sliders } from "lucide-react";

interface SliderPuzzleElementProps {
  element: DesignElement;
  onClick: (e: React.MouseEvent) => void;
}

const SliderPuzzleElement: React.FC<SliderPuzzleElementProps> = ({ element, onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const config = element.sliderPuzzleConfig;
  
  if (!config) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };
  
  // Create preview of the sliders
  const renderSliderPreview = () => {
    return (
      <div className="flex flex-col gap-3 w-full px-4">
        {Array(config.sliderCount).fill(0).map((_, index) => (
          <div key={index} className="w-full h-2 bg-blue-100 rounded-full relative overflow-hidden">
            <div 
              className="absolute h-full bg-blue-500 rounded-full"
              style={{ 
                width: `${(config.currentValues[index] / config.maxValue) * 100}%`
              }}
            />
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <>
      <div
        className="w-full h-full flex flex-col p-2 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="text-sm font-medium">{config.name}</h3>
          <Sliders className="h-4 w-4 text-blue-600" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {renderSliderPreview()}
        </div>
      </div>
      
      <SliderPuzzleModal
        element={element}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SliderPuzzleElement;
