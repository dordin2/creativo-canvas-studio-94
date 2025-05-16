
import { useState } from "react";
import { DesignElement } from "@/context/DesignContext";
import { useDesignState } from "@/context/DesignContext";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, RotateCw } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { getRotation } from "@/utils/elementStyles";

interface FloatingSmartSliderProps {
  element: DesignElement;
  className?: string;
}

const FloatingSmartSlider = ({ element, className = "" }: FloatingSmartSliderProps) => {
  const { updateElement } = useDesignState();
  const [isRotationMode, setIsRotationMode] = useState(false);
  
  const calculateScale = () => {
    if (element.originalSize && element.size) {
      return Math.round((element.size.width / element.originalSize.width) * 100);
    }
    return 100;
  };
  
  const handleScaleChange = (value: number[]) => {
    if (!element.originalSize) return;
    
    const scalePercentage = value[0];
    const scaleFactor = scalePercentage / 100;
    const newWidth = Math.round(element.originalSize.width * scaleFactor);
    const newHeight = Math.round(element.originalSize.height * scaleFactor);
    
    updateElement(element.id, {
      size: {
        width: newWidth,
        height: newHeight
      }
    });
  };
  
  const handleRotationChange = (value: number[]) => {
    const newRotation = Math.round(value[0]);
    updateElement(element.id, {
      style: { ...element.style, transform: `rotate(${newRotation}deg)` }
    });
  };
  
  return (
    <div className={`flex items-center gap-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg ${className}`}>
      <div className="flex-1 min-w-[200px]">
        <Slider 
          value={[isRotationMode ? getRotation(element) : calculateScale()]}
          min={isRotationMode ? -180 : 10}
          max={isRotationMode ? 180 : 200}
          step={1}
          onValueChange={isRotationMode ? handleRotationChange : handleScaleChange}
          className="w-full"
        />
      </div>
      
      <Toggle 
        pressed={isRotationMode}
        onPressedChange={setIsRotationMode}
        className="ml-2"
      >
        {isRotationMode ? (
          <RotateCw className="h-4 w-4" />
        ) : (
          <ZoomIn className="h-4 w-4" />
        )}
      </Toggle>
      
      <div className="w-12 text-sm font-medium text-gray-600">
        {isRotationMode ? `${getRotation(element)}°` : `${calculateScale()}%`}
      </div>
    </div>
  );
};

export default FloatingSmartSlider;
