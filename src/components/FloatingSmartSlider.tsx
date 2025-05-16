
import { useState, useEffect, useRef } from "react";
import { DesignElement } from "@/context/DesignContext";
import { useDesignState } from "@/context/DesignContext";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, RotateCw } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { getRotation } from "@/utils/elementStyles";
import { useIsMobile } from "@/hooks/use-mobile";

interface FloatingSmartSliderProps {
  element: DesignElement;
  className?: string;
}

const FloatingSmartSlider = ({ element, className = "" }: FloatingSmartSliderProps) => {
  const { updateElement, updateElementWithoutHistory } = useDesignState();
  const [isRotationMode, setIsRotationMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderValueRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  
  const calculateScale = () => {
    if (element.originalSize && element.size) {
      return Math.round((element.size.width / element.originalSize.width) * 100);
    }
    return 100;
  };
  
  // Update the slider ref value
  useEffect(() => {
    sliderValueRef.current = isRotationMode ? getRotation(element) : calculateScale();
  }, [element, isRotationMode]);

  const handleScaleChange = (value: number[]) => {
    if (!element.originalSize) return;
    
    setIsDragging(true);
    sliderValueRef.current = value[0];
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const scalePercentage = value[0];
      const scaleFactor = scalePercentage / 100;
      const newWidth = Math.round(element.originalSize.width * scaleFactor);
      const newHeight = Math.round(element.originalSize.height * scaleFactor);
      
      // Use the non-history version during dragging for better performance
      updateElementWithoutHistory(element.id, {
        size: {
          width: newWidth,
          height: newHeight
        },
        style: {
          ...element.style,
          willChange: 'width, height',
        }
      });
    });
  };
  
  const handleRotationChange = (value: number[]) => {
    setIsDragging(true);
    sliderValueRef.current = value[0];
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const newRotation = Math.round(value[0]);
      updateElementWithoutHistory(element.id, {
        style: { 
          ...element.style, 
          transform: `rotate(${newRotation}deg)`,
          willChange: 'transform',
        }
      });
    });
  };
  
  const handleSliderCommit = () => {
    setIsDragging(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Commit the final value to history
    if (isRotationMode) {
      updateElement(element.id, {
        style: { 
          ...element.style, 
          transform: `rotate(${Math.round(sliderValueRef.current)}deg)`,
          willChange: 'auto',
        }
      });
    } else if (element.originalSize) {
      const scaleFactor = sliderValueRef.current / 100;
      const newWidth = Math.round(element.originalSize.width * scaleFactor);
      const newHeight = Math.round(element.originalSize.height * scaleFactor);
      
      updateElement(element.id, {
        size: {
          width: newWidth,
          height: newHeight
        },
        style: {
          ...element.style,
          willChange: 'auto',
        }
      });
    }
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
          onValueCommit={handleSliderCommit}
          className="w-full"
        />
      </div>
      
      <Toggle 
        pressed={isRotationMode}
        onPressedChange={setIsRotationMode}
        className={`ml-2 ${isMobile ? 'h-10 w-10' : ''}`}
      >
        {isRotationMode ? (
          <RotateCw className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
        ) : (
          <ZoomIn className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
        )}
      </Toggle>
      
      <div className="w-12 text-sm font-medium text-gray-600">
        {isRotationMode ? `${getRotation(element)}°` : `${calculateScale()}%`}
      </div>
    </div>
  );
};

export default FloatingSmartSlider;
